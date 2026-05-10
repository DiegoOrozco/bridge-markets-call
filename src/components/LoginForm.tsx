'use client';

import { useState } from 'react';
import { login } from '@/actions/auth';
import { Lock } from 'lucide-react';

export default function LoginForm() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(code);
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      window.location.reload(); // Recarga para entrar al stream
    }
  };

  return (
    <div className="login-wrapper">
      <div className="glass-card">
        <div className="icon-container">
          <Lock size={32} />
        </div>
        <h2>Acceso Restringido</h2>
        <p>Bridge Markets Exclusive Access</p>

        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Ingresa tu código de acceso" 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            autoComplete="off"
            spellCheck="false"
          />
          {error && <span className="error-text">{error}</span>}
          <button type="submit" disabled={loading}>
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
