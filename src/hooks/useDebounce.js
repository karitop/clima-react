import { useEffect, useState } from "react";

export default function useDebounce(valor, ms){
    const [valorRetrasado, setValorRetrasado] = useState(valor) 
    useEffect(() => {
        const id = setTimeout(() => setValorRetrasado(valor), ms);
        return() => clearTimeout(id);
    }, [valor]);

    return valorRetrasado;
}