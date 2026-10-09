import './App.css'
import { useState, useMemo, useRef, useEffect } from "react";
import { useFetch } from './hooks/useFetch';
import { describirClima } from "./clima"
import useDebounce from './hooks/useDebounce';

/* Código og del paso 1
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

  // const url1 = texto.length >= 3 
  // ? `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(texto)}&count=5&language=es`
  // : null;
  const textoRetrasado = useDebounce(texto, 400);
  const url1 = textoRetrasado.length >= 3
    ? `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(textoRetrasado)}&count=5&language=es`
    : null;

  const ciudades = useFetch(url1);
  const lista = ciudades.datos?.results ?? [];

  const url2 = ciudad !== null 
  ? `https://api.open-meteo.com/v1/forecast?latitude=${ciudad.latitude}&longitude=${ciudad.longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
  : null;

  const pronostico = useFetch(url2);

  const resumen = useMemo(() => {
    if(pronostico.datos === null)
      return

    const maximo = Math.max(...pronostico.datos.daily.temperature_2m_max);
    const minimo = Math.min(...pronostico.datos.daily.temperature_2m_min);
    const i = pronostico.datos.daily.temperature_2m_max.indexOf(maximo);
    const diaMasCaluroso = pronostico.datos.daily.time[i];

    console.log("calculando resumen")
    return {
      maximo: maximo,
      minimo: minimo,
      diaMasCaluroso: diaMasCaluroso
    };
  }, [pronostico.datos]);

  const entrada = useRef(null);
  useEffect(() => {
    entrada.current.focus();
  }, []);

  const limpiar = () => {
    setTexto("");
    setCiudad(null);
    entrada.current.focus();
  }

  return(
    <div  className="max-full p-5 bg-white space-y-4 text-sm text-slate-800">
      <h1 className="text-left text-xl font-bold">Clima</h1>
      <div className="flex gap-2">
        <input 
          ref={entrada}
          className="flex-1 border border-slate-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-red-300"
          value={texto} 
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe una ciudad"
        />
        <button
          onClick={limpiar} 
          className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50"
        >Limpiar
        </button>
      </div>

      {ciudades.cargando && <p className="text-slate-500">Buscando...</p>}
      {ciudades.error && <p className="text-red-700">Error: {ciudades.error} </p>}
      {ciudades.datos && !ciudades.cargando && !ciudades.error && lista.length ===0 && (
        <p className="text-slate-500">Sin resultados</p>
      )}

      <ul className="space-y-1">
        {lista.map((c) => (
          <li key={c.id} 
              onClick={() => setCiudad(c)}
              className={
              "px-2 py-1 rounded cursor-pointer hover:bg-slate-50 " +
              (ciudad?.id === c.id ? "bg-slate-100 font-bold" : "")}
          >
            {c.name}, {c.admin1}, {c.country}
          </li>
        ))}
      </ul>

      {pronostico.cargando && <p  className="text-slate-500">Cargando...</p>}
      {pronostico.error && (
        <p className="text-red-700">Error de pronóstico: {pronostico.error} </p>
      )}

      {pronostico.datos && !pronostico.cargando && !pronostico.error && ciudad && (
        
      <div className="border border-slate-200 rounded p-6 space-y-5">
          <p className="text-lg font-bold">{ciudad.name}</p>
         
          <p>
            <span className="text-3xl font-bold">
              {pronostico.datos.current.temperature_2m}°C 
            </span>{" "}
            . {describirClima(pronostico.datos.current.weather_code)} 
            . viento{" "} {pronostico.datos.current.wind_speed_10m} km/h
          </p>

          <p className="bg-amber-50 rounded p-2">
            Esta semana: La temperatura máxima fue de {resumen.maximo}°C. La temperatura mínima fue de {resumen.minimo}°C. 
            El día más caluroso fue el {resumen.diaMasCaluroso}
          </p>
          
         
          <div  className="grid grid-cols-7 gap-1 text-center text-xs">
            {pronostico.datos.daily.time.map((fecha, i) => (

              <div key={fecha} className="border border-slate-200 rounded p-1">
                {fecha.slice(5)}
                <br />
                {describirClima(pronostico.datos.daily.weather_code[i]).split(" ")[0]}
                <br />
                {Math.round(pronostico.datos.daily.temperature_2m_min[i])}–
                {Math.round(pronostico.datos.daily.temperature_2m_max[i])}
              </div>

            ))}
          </div>
      </div>
      )}
    </div>
  );

}