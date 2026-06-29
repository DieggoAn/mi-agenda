import { useState } from 'react';
import { SUPABASE_URL, getHeaders } from '../config';
import '../styles/FormularioNuevoContacto.css';

function FormularioNuevoContacto({ alGuardar, alCancelar }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/contacto`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          nombre: nombre.trim(), 
          apellido: apellido.trim() 
        })
      });

      if (!response.ok) throw new Error('Error al registrar el contacto.');

      const data = await response.json();
      setError('');
      alGuardar(data[0]);
      setNombre('');
      setApellido('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="form-container">
      <h3 className="form-title">Añadir Nuevo Contacto</h3>
      
      <div className="error-container-fixed">
        {error && <div className="error-message-box">{error}</div>}
      </div>

      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-group">
          <label className="form-label">Nombre</label>
          <input 
            type="text" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="form-input"
            placeholder="Ej. Geraldo"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Apellido</label>
          <input 
            type="text" 
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            className="form-input"
            placeholder="Ej. Valenzuela"
          />
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn-submit">Guardar Contacto</button>
          <button type="button" onClick={alCancelar} className="btn-cancel">Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default FormularioNuevoContacto;