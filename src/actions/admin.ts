'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';

// --- Gestión de Video ---
export async function getVideoSettings() {
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({
      data: { videoId: 'So-TGaSbncA' }
    });
  }
  return settings;
}

export async function updateVideoId(newVideoId: string) {
  await prisma.settings.update({
    where: { id: 1 },
    data: { videoId: newVideoId }
  });
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

// --- Gestión de Usuarios ---
export async function getAllUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function createAccessCode(name: string, email: string, accessCode?: string) {
  try {
    let finalCode = accessCode;
    
    if (!finalCode) {
      const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Evitar O, 0, I, 1
      finalCode = '';
      for (let i = 0; i < 7; i++) {
        finalCode += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    }

    await prisma.user.create({
      data: { name, accessCode: finalCode }
    });

    // Enviar correo de bienvenida
    try {
      const path = await import('path');
      const logoPath = path.join(process.cwd(), 'public', 'logo.jpg');
      
      await sendEmail({
        to: email,
        subject: "Bienvenido a la Conferencia Apertura - Bridge Markets Costa Rica",
        text: `Hola ${name}, tu acceso para la conferencia de Bridge Markets es: ${finalCode}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #000; text-align: center; padding: 0;">
              <img src="cid:logo" alt="Bridge Markets Logo" style="width: 100%; max-width: 600px; display: block;">
            </div>
            
            <div style="padding: 40px 30px; text-align: center;">
              <h1 style="color: #1a202c; margin-bottom: 20px; font-size: 24px;">¡Hola, ${name}!</h1>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                Es un honor darte la bienvenida a este momento histórico: la <strong>Conferencia de Apertura de Bridge Markets en Costa Rica</strong>. 
                Estamos construyendo el puente hacia tu futuro financiero y nos emociona que seas parte de esta visión.
              </p>

              <div style="background: linear-gradient(135deg, #1a365d 0%, #2a4365 100%); padding: 30px; border-radius: 12px; margin: 30px 0; color: white;">
                <p style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">Tu Código de Acceso Exclusivo</p>
                <h2 style="margin: 0; font-size: 36px; letter-spacing: 8px; font-weight: bold;">${finalCode}</h2>
              </div>

              <a href="https://bridge-markets-call.vercel.app/" style="background-color: #2b6cb0; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s ease;">
                Acceder a la Transmisión
              </a>
            </div>

            <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; color: #a0aec0; margin: 0;">
                Este es un acceso privado y único para ti.
              </p>
            </div>
          </div>
        `,
        attachments: [{
          filename: 'logo.jpg',
          path: logoPath,
          cid: 'logo'
        }]
      });
    } catch (mailError) {
      console.error("Error al enviar el correo:", mailError);
      // No bloqueamos el flujo si el correo falla, pero lo logueamos
    }

    revalidatePath('/admin');
    return { success: true, code: finalCode };
  } catch (error) {
    console.error("Error en createAccessCode:", error);
    return { success: false, error: 'Error al crear el acceso o el código ya existe.' };
  }
}

export async function removeUser(id: string) {
  await prisma.user.delete({
    where: { id }
  });
  revalidatePath('/admin');
  return { success: true };
}
