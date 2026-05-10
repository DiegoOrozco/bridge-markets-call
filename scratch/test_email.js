const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Cargar .env manualmente para el script
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
});

function formatPrivateKey(key) {
    if (!key) return undefined;
    return key.replace(/\\n/g, '\n');
}

async function testEmail() {
    const credentialsJson = env.GOOGLE_CREDENTIALS;
    const emailUser = env.EMAIL_USER;

    console.log("JSON Length:", credentialsJson?.length);
    // console.log("JSON Raw:", credentialsJson);

    if (!credentialsJson || !emailUser) {
        console.error("Faltan credenciales en .env");
        return;
    }

    try {
        let rawJson = credentialsJson;
        if (rawJson.startsWith("'") && rawJson.endsWith("'")) {
            rawJson = rawJson.slice(1, -1);
        }
        const credentials = JSON.parse(rawJson);
        const privateKey = formatPrivateKey(credentials.private_key);

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: emailUser,
                serviceClient: credentials.client_id,
                privateKey: privateKey,
            }
        });

        console.log("Intentando enviar correo de prueba...");
        const info = await transporter.sendMail({
            from: `"Test" <${emailUser}>`,
            to: emailUser,
            subject: "Prueba de Servicio de Correo",
            text: "Si recibes esto, el sistema funciona."
        });

        console.log("ÉXITO:", info.messageId);
    } catch (error) {
        console.error("ERROR AL ENVIAR:", error);
    }
}

testEmail();
