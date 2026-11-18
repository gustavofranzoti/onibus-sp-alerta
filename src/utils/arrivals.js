/**
 * Funções puras que transformam as respostas da API Olho Vivo
 * em estruturas simples para a interface.
 */

/** Minutos entre a hora da consulta ("hr") e a hora prevista ("t"), ambas "HH:MM". */
export function minutesUntil(queryTime, arrivalTime) {
  const toMin = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };
  let diff = toMin(arrivalTime) - toMin(queryTime);
  if (diff < -720) diff += 1440; // virada de dia (ex.: 23:58 -> 00:03)
  return Math.max(diff, 0);
}

/** Destino da linha conforme o sentido (sl: 1 = TP→TS, 2 = TS→TP). */
function destinationOf(line) {
  return line.sl === 1 ? line.lt1 : line.lt0;
}

/** Normaliza /Previsao/Parada em [{code, id, destination, vehicles:[{minutes, accessible}]}]. */
export function parseStopArrivals(data) {
  const lines = data?.p?.l ?? [];
  return lines
    .map((line) => ({
      code: line.cl,
      id: line.c,
      destination: destinationOf(line),
      vehicles: (line.vs ?? []).map((v) => ({
        minutes: minutesUntil(data.hr, v.t),
        accessible: Boolean(v.a),
      })),
    }))
    .filter((line) => line.vehicles.length > 0)
    .sort((a, b) => a.vehicles[0].minutes - b.vehicles[0].minutes);
}

/** Minutos até o próximo veículo de /Previsao (aceita os dois formatos conhecidos da API). */
export function parseNextVehicleMinutes(data) {
  const vehicles = data?.ps?.[0]?.vs ?? data?.p?.l?.[0]?.vs ?? [];
  if (vehicles.length === 0) return null;
  return Math.min(...vehicles.map((v) => minutesUntil(data.hr, v.t)));
}
