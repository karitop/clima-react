import { useState, useEffect } from "react";

export function useFetch(url){
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    if(!url){
      setDatos(null);
      setCargando(false);
      setError(null);
      return;
    }

    const controlador = new AbortController();
    setCargando(true);
    setError(null);

    fetch(url, { signal: controlador.signal})
    .then((respuesta) => {
      if(!respuesta.ok) throw new Error ("Error "+respuesta.status);
      return respuesta.json();
    })
    .then((d) => {
      setDatos(d);
      setCargando(false);
    })
    .catch((e) => {
      if(e.name === "AbortError") return;
      setError(e.message);
      setCargando(false);
    });

    return() => controlador.abort();
  }, [url]);
  return {datos, cargando, error};
}
