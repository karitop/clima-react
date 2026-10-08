import './App.css'
import { useState, useEffect } from "react";
import { useFetch } from './hooks/useFetch';
import { describirClima } from "./clima"

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
  const [ciudad, setCiudad] = useState(null);

  const url1 = texto.length >= 3 
  ? `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(texto)}&count=5&language=es`
  : null;

  const ciudades = useFetch(url1);
  const lista = ciudades.datos?.results ?? [];

  const url2 = ciudad !== null 
  ? `https://api.open-meteo.com/v1/forecast?latitude=${ciudad.latitude}&longitude=${ciudad.longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
  : null;

  const pronostico = useFetch(url2);

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
          <li key={c.id} onClick={() => setCiudad(c)}>
            {c.name}, {c.admin1}, {c.country}
          </li>
        ))}
      </ul>

      {pronostico.cargando && <p>Cargando...</p>}
      {pronostico.error && <p>Error de pronóstico: {pronostico.error} </p>}
      {pronostico.datos && !pronostico.cargando && !pronostico.error && ciudad && (
         <div>
          <h2>{ciudad.name}</h2>
          <h3>{pronostico.datos.current.temperature_2m}°C . {describirClima(pronostico.datos.current.weather_code)} . {pronostico.datos.current.wind_speed_10m}km/h</h3>
          <ul>
            {pronostico.datos.daily.time.map((fecha, i) => (
              <li key={fecha}>
                {fecha} . {pronostico.datos.daily.temperature_2m_max[i]}°C . {pronostico.datos.daily.temperature_2m_min[i]}°C . {describirClima(pronostico.datos.daily.weather_code[i])}
              </li>
            ))}
          </ul>
      </div>
      )}
    </div>
  );

}