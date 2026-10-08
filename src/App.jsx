import './App.css'
import { useState, useEffect } from "react";
import { useFetch } from './hooks/useFetch';

/*
export default function App(){
  const [texto, setTexto] = useState("");
  const [ciudades, setCiudades] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    if(texto.length < 3){
      setCiudades([]);
      setCargando(false);
      setError(null);
      return;
    }

    const controlador = new AbortController();
    setCargando(true);
    setError(null);

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(texto)}&count=5&language=es`;
    fetch(url, { signal: controlador.signal})
    .then((respuesta) => {
      if(!respuesta.ok) throw new Error ("Error "+respuesta.status);
      return respuesta.json();
    })
    .then((datos) => {
      setCiudades(datos.results ?? []);
      setCargando(false);
    })
    .catch((e) => {
      if(e.name === "AbortError") return;
      setError(e.message);
      setCargando(false);
    });

    return() => controlador.abort();
  }, [texto]);


  return(
    <div>
      <h1>Clima</h1>
      <input 
        value={texto} 
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escribe una ciudad"
      />

      {cargando && <p>Buscando...</p>}
      {error && <p>Error: {error} </p>}
      {texto.length >= 3 && !cargando && !error && ciudades.length ===0 && (
        <p>Sin resultados</p>
      )}

      <ul>
        {ciudades.map((c) => (
          <li key={c.id}>
            {c.name}, {c.admin1}, {c.country}
          </li>
        ))}
      </ul>
    </div>
  );

}
*/


export default function App(){
  const [texto, setTexto] = useState("");

  const url = texto.length >= 3 
  ? `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(texto)}&count=5&language=es`
  : null;

  const ciudades = useFetch(url);
  const lista = ciudades.datos?.results ?? [];


  return(
    <div>
      <h1>Clima</h1>
      <input 
        value={texto} 
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escribe una ciudad"
      />

      {ciudades.cargando && <p>Buscando...</p>}
      {ciudades.error && <p>Error: {ciudades.error} </p>}
      {ciudades.datos && !ciudades.cargando && !ciudades.error && lista.length ===0 && (
        <p>Sin resultados</p>
      )}

      <ul>
        {lista.map((c) => (
          <li key={c.id}>
            {c.name}, {c.admin1}, {c.country}
          </li>
        ))}
      </ul>
    </div>
  );

}