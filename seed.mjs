import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasourceUrl: 'file:./dev.db' });
async function main() {
  await prisma.user.upsert({
    where: { accessCode: 'TEST1234' },
    update: {},
    create: {
      name: 'Usuario de Prueba',
      accessCode: 'TEST1234'
    }
  });
  console.log('✅ Usuario creado con éxito! (Código: TEST1234)');
}
main().catch(console.error).finally(() => prisma.$disconnect());
