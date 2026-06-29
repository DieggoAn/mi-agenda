import { useState, useEffect } from 'react';
import FormularioNuevoContacto from './components/FormularioNuevoContacto';
import DetalleContacto from './components/DetalleContacto';
import { SUPABASE_URL, getHeaders } from './config';
import './styles/App.css';

function App() {
  const [contactos, setContactos] = useState([]);
  const [vistaActual, setVistaActual] = useState('vacio'); 
  const [contactoSeleccionado, setContactoSeleccionado] = useState(null);

  useEffect(() => {
    fetch(`${SUPABASE_URL}/contacto?order=nombre.asc`, { 
      method: 'GET',
      headers: getHeaders() 
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al conectar con la base de datos.');
        return res.json();
      })
      .then(data => setContactos(data))
      .catch(err => console.error("Error inicial:", err));
  }, []);

  const handleGuardarNuevoContacto = (nuevoContactoCreado) => {
    setContactos([...contactos, nuevoContactoCreado]);
    setVistaActual('vacio');
  };

  const handleEliminarContacto = async (id, e) => {
    e.stopPropagation(); 
    
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este contacto y todos sus datos asociados?");
    if (!confirmar) return; 


    try {
      const response = await fetch(`${SUPABASE_URL}/contacto?id_contacto=eq.${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) throw new Error('No se pudo borrar el contacto del servidor.');

      setContactos(contactos.filter(c => c.id_contacto !== id));
      
      if (contactoSeleccionado?.id_contacto === id) {
        setVistaActual('vacio');
        setContactoSeleccionado(null);
      }
    } catch (err) {
      alert(err.message); 
    }
  };

  return (
    <div className="app-container">
      
      <div className="sidebar">
        <h2 className="sidebar-title">Agenda SPA</h2>
        
        <button onClick={() => setVistaActual('nuevo')} className="btn-nuevo-contacto">
          <span>➕</span> Nuevo Contacto
        </button>

        <div className="contacts-list">
          {contactos.map(c => {
            const esSeleccionado = contactoSeleccionado?.id_contacto === c.id_contacto;
            return (
              <div 
                key={c.id_contacto} 
                onClick={() => {
                  setContactoSeleccionado(c);
                  setVistaActual('detalle');
                }}
                className={`contact-item ${esSeleccionado ? 'active' : ''}`}
              >
                <span className="contact-name">{c.nombre} {c.apellido}</span>
                <button 
                  onClick={(e) => handleEliminarContacto(c.id_contacto, e)}
                  className="btn-delete-contact"
                  title="Eliminar contacto"
                >
                  Eliminar
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="main-content">
        <div className={`card-panel ${vistaActual === 'vacio' ? 'centered' : ''}`}>
          
          {vistaActual === 'vacio' && (
            <div className="empty-state">
              <span className="empty-icon">📇</span>
              <p className="empty-text">Selecciona un contacto o agrega uno nuevo para ver la información.</p>
            </div>
          )}

          {vistaActual === 'nuevo' && (
            <FormularioNuevoContacto 
              alGuardar={handleGuardarNuevoContacto} 
              alCancelar={() => setVistaActual('vacio')} 
            />
          )}

          {vistaActual === 'detalle' && (
            <DetalleContacto 
              key={contactoSeleccionado.id_contacto} 
              contacto={contactoSeleccionado} 
            />
          )}

        </div>
      </div>

    </div>
  );
}

export default App;