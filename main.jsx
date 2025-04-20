import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { io } from 'socket.io-client';

const socket = io("https://spyfallbros-backend.onrender.com");
 // Cambiar a Railway URL en producción

function App() {
  const [codigoSala, setCodigoSala] = useState('');
  const [nombreJugador, setNombreJugador] = useState('');
  const [unido, setUnido] = useState(false);
  const [esHost, setEsHost] = useState(false);
  const [jugadores, setJugadores] = useState([]);
  const [rol, setRol] = useState(null);

  useEffect(() => {
    socket.on("jugadores_actualizados", (jugadores) => setJugadores(jugadores));
    socket.on("rol_asignado", (data) => setRol(data));
    socket.on("juego_finalizado", () => {
      alert("La partida ha finalizado.");
      window.location.reload();
    });
    socket.on("error", (msg) => alert(msg));
  }, []);

  const crearSala = () => {
    socket.emit("crear_sala", (res) => {
      setCodigoSala(res.codigo);
      setEsHost(true);
      setNombreJugador("Anfitrión");
      setUnido(true);
    });
  };

  const unirseSala = () => {
    if (!codigoSala || !nombreJugador) return alert("Faltan datos");
    socket.emit("unirse_sala", { codigo: codigoSala, nombre: nombreJugador }, (res) => {
      if (res.exito) setUnido(true);
      else alert(res.mensaje);
    });
  };

  const iniciarJuego = () => socket.emit("iniciar_juego", codigoSala);
  const finalizarJuego = () => socket.emit("finalizar_juego", codigoSala);

  if (!unido) {
    return (
      <div style={{ padding: 30 }}>
        <h1>SpyfallBros</h1>
        <button onClick={crearSala}>Crear Sala</button>
        <hr />
        <input placeholder="Código de sala" onChange={e => setCodigoSala(e.target.value.toUpperCase())} /><br />
        <input placeholder="Tu nombre" onChange={e => setNombreJugador(e.target.value)} /><br />
        <button onClick={unirseSala}>Unirse a Sala</button>
      </div>
    );
  }

  if (rol) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Tu Rol: {rol.rol}</h2>
        {rol.ubicacion && <p>Ubicación: {rol.ubicacion}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>Sala: {codigoSala}</h2>
      <h3>Jugadores:</h3>
      <ul>{jugadores.map((j, i) => <li key={i}>{j.nombre}</li>)}</ul>
      {esHost && <>
        <button onClick={iniciarJuego}>Iniciar Juego</button><br />
        <button onClick={finalizarJuego}>Finalizar Juego</button>
      </>}
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
