import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html: string;
  attachments?: any[];
}

export async function sendEmail({ to, subject, text, html, attachments }: EmailOptions) {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('❌ Email configuration missing (EMAIL_USER or EMAIL_PASS)');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Bridge Markets" <${EMAIL_USER}>`,
      to,
      subject,
      text: text || subject,
      html,
      attachments,
    });

    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}
