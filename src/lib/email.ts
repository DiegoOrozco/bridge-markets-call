import nodemailer from "nodemailer";

let transporter: any = null;

function getTransporter() {
    if (!transporter) {
        const credentialsJson = process.env.GOOGLE_CREDENTIALS;
        const emailUser = process.env.EMAIL_USER;

        if (!credentialsJson || !emailUser) {
            console.error("[EMAIL] Missing GOOGLE_CREDENTIALS or EMAIL_USER in .env");
            return null;
        }

        try {
            const credentials = JSON.parse(credentialsJson);
            
            transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    type: 'OAuth2',
                    user: emailUser,
                    serviceClient: credentials.client_id,
                    privateKey: credentials.private_key,
                }
            } as any);
        } catch (error) {
            console.error("[EMAIL] Error initializing transporter:", error);
            return null;
        }
    }
    return transporter;
}

export async function sendEmail({ 
    to, 
    subject, 
    html 
}: { 
    to: string; 
    subject: string; 
    html: string; 
}) {
    const currentTransporter = getTransporter();
    if (!currentTransporter) {
        throw new Error("No se pudo configurar el servicio de correo.");
    }

    const emailUser = process.env.EMAIL_USER;

    try {
        const info = await currentTransporter.sendMail({
            from: `"Búnker Digital" <${emailUser}>`,
            to,
            subject,
            html,
        });
        console.log("[EMAIL] Correo enviado:", info.messageId);
        return info;
    } catch (error) {
        console.error("[EMAIL] Error al enviar correo:", error);
        throw error;
    }
}
