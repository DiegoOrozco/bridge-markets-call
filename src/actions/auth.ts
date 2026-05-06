'use server';

import { cookies, headers } from 'next/headers';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function login(accessCode: string) {
  const user = await prisma.user.findUnique({
    where: { accessCode }
  });

  if (!user) {
    return { error: 'Código de acceso inválido' };
  }

  const sessionToken = crypto.randomBytes(32).toString('hex');
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'IP Desconocida';

  await prisma.user.update({
    where: { id: user.id },
    data: { 
      activeSessionToken: sessionToken,
      lastIpAddress: ip
    }
  });

  const cookieStore = await cookies();
  cookieStore.set('accessCode', user.accessCode, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  cookieStore.set('sessionToken', sessionToken, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  return { success: true };
}

export async function checkSession() {
  const cookieStore = await cookies();
  const accessCode = cookieStore.get('accessCode')?.value;
  const sessionToken = cookieStore.get('sessionToken')?.value;

  if (!accessCode || !sessionToken) {
    return { valid: false };
  }

  const user = await prisma.user.findUnique({
    where: { accessCode }
  });

  if (!user || user.activeSessionToken !== sessionToken) {
    return { valid: false };
  }

  return { 
    valid: true, 
    user: { name: user.name, ip: user.lastIpAddress } 
  };
}

export async function logout() {
  const cookieStore = await cookies();
  const accessCode = cookieStore.get('accessCode')?.value;

  if (accessCode) {
    await prisma.user.update({
      where: { accessCode },
      data: { activeSessionToken: null }
    }).catch(() => {});
  }

  cookieStore.delete('accessCode');
  cookieStore.delete('sessionToken');
}
