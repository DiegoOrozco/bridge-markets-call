import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Esto creará un usuario de prueba en la base de datos de producción (Neon)
    const user = await prisma.user.upsert({
      where: { accessCode: 'TEST1234' },
      update: {},
      create: {
        name: 'Administrador Bridge',
        accessCode: 'TEST1234'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Base de datos sincronizada y usuario TEST1234 creado.',
      user 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
