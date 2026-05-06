import { cookies } from 'next/headers';
import { checkSession } from '@/actions/auth';
import SecurePlayer from '@/components/SecurePlayer';
import LoginForm from '@/components/LoginForm';

export default async function Home() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken');
  
  // Si no hay token en cookies, renderiza el login
  if (!sessionToken) {
    return <LoginForm />;
  }

  // Verifica con la base de datos si la sesión es la última válida
  const session = await checkSession();
  
  if (!session.valid) {
    return <LoginForm />;
  }

  return (
    <main className="main-container">
      <SecurePlayer videoId="So-TGaSbncA" /> 
      {/* Cambia el videoId por el de tu transmisión real */}
    </main>
  );
}
