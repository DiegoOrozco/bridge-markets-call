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
