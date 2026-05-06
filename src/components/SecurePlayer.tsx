'use client';

import { useEffect, useState, useRef } from 'react';
import { Maximize, LogOut, Volume2 } from 'lucide-react';
import { checkSession, logout } from '@/actions/auth';

interface SecurePlayerProps {
  videoId: string;
}

export default function SecurePlayer({ videoId }: SecurePlayerProps) {
  const [user, setUser] = useState<{ name: string; ip: string | null } | null>(null);
  const [watermarkPos, setWatermarkPos] = useState({ top: '20%', left: '20%' });
  const containerRef = useRef<HTMLDivElement>(null);

  // Poll de sesión cada 5 segundos
  useEffect(() => {
    let isMounted = true;
    
    const verify = async () => {
      const res = await checkSession();
      if (!res.valid && isMounted) {
        window.location.href = '/'; // Redirige al login si fue expulsado
      } else if (res.user && isMounted) {
        setUser(res.user);
      }
    };

    verify();
    const interval = setInterval(verify, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Movimiento de la marca de agua cada 5 minutos (300000ms)
  // Para pruebas pondremos 10 segundos
  useEffect(() => {
    const moveWatermark = () => {
      const top = Math.floor(Math.random() * 80) + '%';
      const left = Math.floor(Math.random() * 70) + '%';
      setWatermarkPos({ top, left });
    };

    const interval = setInterval(moveWatermark, 10000); // 10s para ver el efecto rápido
    return () => clearInterval(interval);
  }, []);

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  if (!user) return <div className="loader">Cargando Búnker...</div>;

  return (
    <div className="player-wrapper">
      <div className="player-header">
        <h1>Transmisión Segura</h1>
        <button className="btn-logout" onClick={handleLogout}>
          <LogOut size={16} /> Salir
        </button>
      </div>

      <div 
        ref={containerRef}
        className="video-container" 
        onContextMenu={(e) => e.preventDefault()} // Bloquea click derecho
      >
        {/* Capas Fantasma para bloquear clics hacia YouTube */}
        <div className="ghost-layer top-layer"></div>
        <div className="ghost-layer bottom-layer"></div>

        {/* Marca de Agua Dinámica */}
        <div 
          className="watermark"
          style={{ top: watermarkPos.top, left: watermarkPos.left }}
        >
          {user.name} - {user.ip}
        </div>

        {/* Iframe de YouTube (Oculto de búsquedas) */}
        <iframe 
          className="youtube-iframe"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&disablekb=1&fs=0`}
          frameBorder="0" 
          allow="autoplay; encrypted-media" 
        ></iframe>

        {/* Controles Custom (Superpuestos) */}
        <div className="custom-controls">
          <button className="control-btn" onClick={handleFullscreen} title="Pantalla Completa">
            <Maximize size={24} />
          </button>
        </div>
      </div>
      <p style={{ textAlign: 'center', color: '#666', fontSize: '0.8rem', marginTop: '10px' }}>
        * Si no escuchas nada, toca el video para activar el audio (Restricción de navegadores).
      </p>
    </div>
  );
}
