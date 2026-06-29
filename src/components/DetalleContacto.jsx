import { useState, useEffect, useCallback } from 'react';
import { SUPABASE_URL, getHeaders } from '../config';
import '../styles/DetalleContacto.css';



function DetalleContacto({ contacto }) {
  const [subDatos, setSubDatos] = useState([]);
  const [tipo, setTipo] = useState('Personal');
  const [correo, setCorreo] = useState('');
  
  const [codigoPais, setCodigoPais] = useState('+56'); 
  const [telefono, setTelefono] = useState('');
  
  const [direccion, setDirección] = useState('');
  const [error, setError] = useState('');

  const validarFormatoTelefono = (numero) => {
    if (!numero) return true; 
    const regexTelefono = /^[0-9]{6,12}$/;
    return regexTelefono.test(numero);
  };

  const cargarSubDatos = useCallback(async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/dato_contacto?id_contacto=eq.${contacto.id_contacto}`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('No se pudieron cargar los datos.');
      const data = await response.json();
      setSubDatos(data);
    } catch (err) {
      setError(err.message);
    }
  }, [contacto.id_contacto]);

  useEffect(() => {
    cargarSubDatos();
  }, [cargarSubDatos]);

	const validarFormatoCorreo = (email) => {
		if (!email) return true;
		const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		return regexCorreo.test(email);
	};

	const handleAgregarDato = async (e) => {
		e.preventDefault();
		
		const telefonoTrimmed = telefono.trim();
		const correoTrimmed = correo.trim().toLowerCase(); 
		const direccionTrimmed = direccion.trim();

    if (telefonoTrimmed && !validarFormatoTelefono(telefonoTrimmed)) {
      setError('El teléfono no es válido. Debe contener solo números (entre 6 y 12 dígitos).');
      return;
    }

    if (correoTrimmed && !validarFormatoCorreo(correoTrimmed)) {
      setError('El formato del correo electrónico no es válido (ejemplo: usuario@dominio.com).');
      return;
    }
    
    if (!correoTrimmed && !telefonoTrimmed && !direccionTrimmed) {
      setError('Debes rellenar al menos un campo del set (Correo, Teléfono o Dirección).');
      return;
    }

    let codigoLimpio = codigoPais.trim();
    
    if (telefonoTrimmed && !codigoLimpio) {
      codigoLimpio = '+56'; 
    }

    if (codigoLimpio.length > 0) {
      if (codigoLimpio.startsWith('00')) { 
        codigoLimpio = '+' + codigoLimpio.substring(2);
      } else if (!codigoLimpio.startsWith('+')) {
        codigoLimpio = '+' + codigoLimpio;
      }
    }

    const telefonoCompleto = telefonoTrimmed 
      ? `${codigoLimpio} ${telefonoTrimmed}` 
      : null;

		try {
			const response = await fetch(`${SUPABASE_URL}/dato_contacto`, {
				method: 'POST',
				headers: getHeaders(),
				body: JSON.stringify({
					id_contacto: contacto.id_contacto,
					tipo,
					correo: correoTrimmed || null, 
					telefono: telefonoCompleto, 
					direccion: direccionTrimmed || null
				})
			});

			if (!response.ok) throw new Error('Error al guardar el set de datos en el servidor.');

			setError('');
			setCorreo('');
			setTelefono(''); 
			setDirección('');
			cargarSubDatos();
		} catch (err) {
			setError(err.message);
  	}
	};

  const handleEliminarDato = async (id_dato_contacto) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este set de datos?");
    if (!confirmar) return;

    try {
      const response = await fetch(`${SUPABASE_URL}/dato_contacto?id_dato_contacto=eq.${id_dato_contacto}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) throw new Error('No se pudo eliminar el set de datos.');
      setSubDatos(subDatos.filter(dato => dato.id_dato_contacto !== id_dato_contacto));
    } catch (err) {
      setError(err.message);
    }
  };

  const getBadgeClass = (tipoContacto) => {
    if (tipoContacto === 'Trabajo') return 'badge-trabajo';
    if (tipoContacto === 'Casa') return 'badge-casa';
    return 'badge-personal';
  };

  return (
    <div className="detalle-container">
      <div className="detalle-header">
        <h3 className="detalle-nombre">{contacto.nombre} {contacto.apellido}</h3>
      </div>

      <div className="error-container-fixed">
        {error && <div className="error-message-box">{error}</div>}
      </div>

      <div className="subdatos-section">
        <h4 className="section-title">Sets de datos guardados</h4>
        {subDatos.length === 0 ? (
          <p className="no-data">Este contacto no tiene información asociada en la base de datos.</p>
        ) : (
          <div className="subdatos-list">
            {subDatos.map(dato => (
              <div key={dato.id_dato_contacto} className="subdato-item">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '80%' }}>
                  <div>
                    <span className={`badge ${getBadgeClass(dato.tipo)}`}>
                      Tipo: {dato.tipo}
                    </span>
                  </div>
                  {dato.telefono && <p style={{ margin: '0', fontSize: '14px', color: '#374151' }}><strong>Teléfono:</strong> {dato.telefono}</p>}
                  {dato.correo && <p style={{ margin: '0', fontSize: '14px', color: '#374151' }}><strong>Correo:</strong> {dato.correo}</p>}
                  {dato.direccion && <p style={{ margin: '0', fontSize: '14px', color: '#374151' }}><strong>Dirección:</strong> {dato.direccion}</p>}
                </div>
                <button onClick={() => handleEliminarDato(dato.id_dato_contacto)} className="btn-quitar">
                  Quitar set
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="agregar-dato-box">
        <h4 className="box-title">Agregar set de datos de contacto</h4>
        <form onSubmit={handleAgregarDato} className="agregar-dato-form">
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label className="form-label">Tipo Asociado (Obligatorio)</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="select-input" style={{ width: '100%' }}>
              <option value="Personal">Personal</option>
              <option value="Trabajo">Trabajo</option>
              <option value="Casa">Casa</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', display: 'block' }}>
              Información del set (Rellena al menos uno)
            </label>
            
            <div className="inputs-row-container">
              <input 
                type="text"
                value={codigoPais}
                onChange={(e) => setCodigoPais(e.target.value)}
                placeholder="+56"
								maxLength="4"
                className="form-input input-cod"
              />
              <input 
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Teléfono"
                className="form-input input-tel"
              />
              <input 
                type="text"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="Correo electrónico"
                className="form-input input-mail"
              />
            </div>

            <input 
              type="text"
              value={direccion}
              onChange={(e) => setDirección(e.target.value)}
              placeholder="Dirección postal (Ej. Av. Alemania 123)"
              className="form-input"
              style={{ marginTop: '8px' }}
            />
          </div>

          <button type="submit" className="btn-add-dato" style={{ width: '100%', marginTop: '10px' }}>
            Guardar set de datos
          </button>
        </form>
      </div>
    </div>
  );
}

export default DetalleContacto;