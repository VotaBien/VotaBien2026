// src/utils/riesgo.ts

export interface CandidatoRaw {
    data_lista_inicial: {
        strDocumentoIdentidad: string;
        strNombres: string;
        strApellidoPaterno: string;
        strApellidoMaterno: string;
        strOrganizacionPolitica: string;
        strCargo: string;
        strGuidFoto: string; 
        idOrganizacionPolitica: number;
    };
    data_hoja_vida: {
        lSentenciaPenal?: any[];
        lSentenciaObliga?: any[];
        lRenunciaOP?: any[];
        oEduBasica?: {
            strConcluidoEduSecundaria?: string;
        };
        // Agregamos tipos para evitar errores de autocompletado
        oIngresos?: any;
        lTitularidad?: any[];
    };
}

export function calcularPerfilRiesgo(candidato: CandidatoRaw) {
    let puntaje = 10; // Puntaje inicial perfecto
    const detalles: string[] = [];
    const hv = candidato.data_hoja_vida;

    // --- 1. SENTENCIAS PENALES (Factor Crítico) ---
    const sentenciasPenales = hv.lSentenciaPenal || [];
    if (sentenciasPenales.length > 0) {
        const descuento = sentenciasPenales.length * 5;
        puntaje -= descuento;
        detalles.push(`🚨 Tiene ${sentenciasPenales.length} sentencia(s) penal(es) (-${descuento} pts)`);
    }

    // --- 2. DEMANDAS POR ALIMENTOS / CONTRACTUALES ---
    const sentenciasObliga = hv.lSentenciaObliga || [];
    if (sentenciasObliga.length > 0) {
        const descuento = sentenciasObliga.length * 3;
        puntaje -= descuento;
        detalles.push(`⚠️ Tiene ${sentenciasObliga.length} demanda(s) por alimentos/dinero (-${descuento} pts)`);
    }

    // --- 3. CAMISETAS (Inestabilidad Política) ---
    const renuncias = hv.lRenunciaOP || [];
    if (renuncias.length > 2) {
        puntaje -= 1; // Penalidad fija
        detalles.push(`👕 Historial inestable: Ha renunciado a ${renuncias.length} partidos (-1 pt)`);
    }

    // --- 4. EDUCACIÓN BÁSICA ---
    if (hv.oEduBasica?.strConcluidoEduSecundaria === '2') {
        puntaje -= 1; // Penalidad fija
        detalles.push(`🎓 No registra secundaria completa (-1 pt)`);
    }

    // LÍMITES: El puntaje no puede escapar del rango 1-10
    const puntajeFinal = Math.max(1, Math.min(10, puntaje));

    // Determinar Colores y Etiquetas Visuales
    let color = "bg-green-500";
    let textoColor = "text-green-700";
    let etiqueta = "CONFIABLE";

    if (puntajeFinal < 5) {
        color = "bg-red-600";
        textoColor = "text-red-700";
        etiqueta = "ALTO RIESGO";
    } else if (puntajeFinal < 8) {
        color = "bg-yellow-500";
        textoColor = "text-yellow-700";
        etiqueta = "RIESGO MEDIO";
    }

    return {
        valor: parseFloat(puntajeFinal.toFixed(1)), // Ej: 7.5
        detalles,
        color,
        textoColor,
        etiqueta
    };
}