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
      await sendEmail({
        to: email,
        subject: "Tu acceso al Búnker Digital - Bridge Markets",
        text: `Hola ${name}, tu código de acceso al Búnker Digital es: ${finalCode}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb; text-align: center;">¡Bienvenido al Búnker Digital!</h2>
            <p>Hola <strong>${name}</strong>,</p>
            <p>Se te ha otorgado acceso a la plataforma de streaming exclusivo de Bridge Markets.</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Tu código de acceso es:</p>
              <h1 style="margin: 10px 0; letter-spacing: 5px; color: #111827;">${finalCode}</h1>
            </div>
            <p style="text-align: center;">
              <a href="https://bunker.bridgemarkets.com" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Entrar al Búnker</a>
            </p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              Si tienes problemas para entrar, contacta con soporte.
            </p>
          </div>
        `
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
