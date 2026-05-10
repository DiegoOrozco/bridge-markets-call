'use client';

import { useState, useEffect } from 'react';
import { getVideoSettings, updateVideoId, getAllUsers, createAccessCode, removeUser } from '@/actions/admin';
import { Save, UserPlus, Trash2, Video, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [videoId, setVideoId] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCode, setNewCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const settings = await getVideoSettings();
    const allUsers = await getAllUsers();
    setVideoId(settings.videoId);
    setUsers(allUsers);
    setLoading(false);
  };

  const handleUpdateVideo = async () => {
    await updateVideoId(videoId);
    setMessage('Video actualizado correctamente');
    setTimeout(() => setMessage(''), 3000);
  };

  const generateCode = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 7; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setNewCode(code);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createAccessCode(newName, newEmail, newCode);
    if (res.success) {
      setNewName('');
      setNewEmail('');
      setNewCode('');
      loadData();
      setMessage(`Usuario creado y correo enviado. Código: ${res.code}`);
    } else {
      setMessage(res.error || 'Error');
    }
    setTimeout(() => setMessage(''), 5000);
  };

  const [bulkLoading, setBulkLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      // Asumimos que la primera línea es el encabezado: nombre, correo
      const data = lines.slice(1).map(line => {
        const parts = line.split(',').map(p => p.trim());
        return { name: parts[0], email: parts[1] };
      }).filter(u => u.name && u.email);

      if (data.length === 0) {
        setMessage('No se encontraron datos válidos en el CSV. Formato: nombre, correo');
        return;
      }

      if (!confirm(`¿Deseas registrar a ${data.length} usuarios y enviar sus correos? (Se enviarán uno cada 7 segundos)`)) {
        return;
      }

      setBulkLoading(true);
      setProgress({ current: 0, total: data.length });

      for (let i = 0; i < data.length; i++) {
        const user = data[i];
        setProgress(p => ({ ...p, current: i + 1 }));
        
        try {
          const res = await createAccessCode(user.name, user.email);
          if (!res.success) {
            console.error(`Error con ${user.email}:`, res.error);
          }
        } catch (err) {
          console.error(`Fallo crítico con ${user.email}:`, err);
        }

        // Esperar entre 5 y 10 segundos (7 seg promedio) para evitar spam
        if (i < data.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 7000));
        }
      }

      setBulkLoading(false);
      loadData();
      setMessage('Carga masiva completada con éxito.');
      setTimeout(() => setMessage(''), 5000);
    };
    reader.readAsText(file);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('¿Borrar este acceso?')) {
      await removeUser(id);
      loadData();
    }
  };

  if (loading) return <div className="loader">Cargando Panel...</div>;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <Link href="/" className="back-link"><ArrowLeft size={20} /> Volver a Bridge Markets</Link>
        <h1>Panel de Control</h1>
        {message && <div className="admin-toast">{message}</div>}
      </header>

      <div className="admin-grid">
        {/* Configuración de Video */}
        <section className="admin-card">
          <div className="card-title">
            <Video size={20} />
            <h2>Streaming Live</h2>
          </div>
          <div className="form-group">
            <label>ID del Video de YouTube</label>
            <div className="input-with-btn">
              <input 
                type="text" 
                value={videoId} 
                onChange={(e) => setVideoId(e.target.value)}
                placeholder="Ej: So-TGaSbncA"
              />
              <button className="btn-primary" onClick={handleUpdateVideo}>
                <Save size={18} /> Guardar
              </button>
            </div>
            <p className="hint">Solo pega el código que aparece después de "v=" en el link de YT.</p>
          </div>
        </section>

        {/* Crear Usuario */}
        <section className="admin-card">
          <div className="card-title">
            <UserPlus size={20} />
            <h2>Nuevo Acceso</h2>
          </div>
          <form onSubmit={handleAddUser} className="admin-form">
            <div className="form-group">
              <label>Nombre del Usuario</label>
              <input 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Juan Perez"
                required
              />
            </div>
            <div className="form-group">
              <label>Correo Electrónico</label>
              <input 
                type="email" 
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Ej: juan@gmail.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Código de Acceso</label>
              <div className="input-with-btn">
                <input 
                  type="text" 
                  value={newCode} 
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Ej: AB12345"
                  required
                />
                <button type="button" className="btn-secondary" onClick={generateCode} title="Generar código aleatorio">
                  Random
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary full-width">
              Crear Usuario
            </button>
          </form>
        </section>

        {/* Carga Masiva */}
        <section className="admin-card">
          <div className="card-title">
            <Users size={20} />
            <h2>Carga Masiva (CSV)</h2>
          </div>
          <div className="admin-form">
            <p className="hint" style={{ marginBottom: '15px' }}>
              Sube un archivo .csv con columnas <strong>nombre, correo</strong>.
            </p>
            <div className="file-upload-container">
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleCSVUpload} 
                disabled={bulkLoading}
                id="csv-upload"
                style={{ display: 'none' }}
              />
              <label htmlFor="csv-upload" className={`btn-secondary full-width ${bulkLoading ? 'disabled' : ''}`} style={{ cursor: bulkLoading ? 'not-allowed' : 'pointer', textAlign: 'center', display: 'block', padding: '10px' }}>
                {bulkLoading ? 'Procesando...' : 'Seleccionar Archivo .CSV'}
              </label>
            </div>

            {bulkLoading && (
              <div className="bulk-progress" style={{ marginTop: '20px' }}>
                <div className="progress-text">
                  Procesando: {progress.current} de {progress.total}
                </div>
                <div className="progress-bar-bg" style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${(progress.current / progress.total) * 100}%`, 
                      background: '#2b6cb0', 
                      height: '100%',
                      transition: 'width 0.3s ease'
                    }} 
                  />
                </div>
                <p className="hint" style={{ marginTop: '10px', fontSize: '11px' }}>
                  No cierres esta pestaña hasta terminar.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Lista de Usuarios */}
        <section className="admin-card full-row">
          <div className="card-title">
            <Users size={20} />
            <h2>Usuarios con Acceso ({users.length})</h2>
          </div>
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Código</th>
                  <th>Creado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td><code>{u.accessCode}</code></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-danger" onClick={() => handleDeleteUser(u.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
