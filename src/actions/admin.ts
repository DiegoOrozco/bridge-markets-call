'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

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

export async function createAccessCode(name: string, accessCode?: string) {
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
    revalidatePath('/admin');
    return { success: true, code: finalCode };
  } catch (error) {
    return { success: false, error: 'El código ya existe o es inválido.' };
  }
}

export async function removeUser(id: string) {
  await prisma.user.delete({
    where: { id }
  });
  revalidatePath('/admin');
  return { success: true };
}
