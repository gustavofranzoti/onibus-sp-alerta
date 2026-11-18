import { OLHOVIVO_BASE_URL, OLHOVIVO_TOKEN } from '../config';

let authenticated = false;

/** Autentica na API. O cookie de sessão é guardado automaticamente pelo sistema. */
async function authenticate() {
  if (!OLHOVIVO_TOKEN || OLHOVIVO_TOKEN === 'COLE_SEU_TOKEN_AQUI') {
    throw new Error('Token da SPTrans não configurado. Crie o arquivo .env (veja o README).');
  }
  const res = await fetch(
    `${OLHOVIVO_BASE_URL}/Login/Autenticar?token=${encodeURIComponent(OLHOVIVO_TOKEN)}`,
    { method: 'POST', credentials: 'include' }
  );
  const ok = await res.json();
  if (ok !== true) {
    throw new Error('A SPTrans recusou o token. Confira o valor no arquivo .env.');
  }
  authenticated = true;
}

/** GET autenticado; reautentica uma vez se a sessão expirar (401). */
async function get(path) {
  if (!authenticated) await authenticate();

  let res = await fetch(`${OLHOVIVO_BASE_URL}${path}`, { credentials: 'include' });
  if (res.status === 401) {
    authenticated = false;
    await authenticate();
    res = await fetch(`${OLHOVIVO_BASE_URL}${path}`, { credentials: 'include' });
  }
  if (!res.ok) throw new Error(`Erro ${res.status} ao consultar a SPTrans.`);
  return res.json();
}

/** Busca pontos por nome ou endereço. Retorna [{cp, np, ed, py, px}]. */
export function searchStops(term) {
  return get(`/Parada/Buscar?termosBusca=${encodeURIComponent(term)}`);
}

/** Previsão de chegada de todas as linhas em um ponto. */
export function getStopArrivals(stopCode) {
  return get(`/Previsao/Parada?codigoParada=${stopCode}`);
}

/** Previsão de uma linha específica em um ponto. */
export function getLineArrivals(stopCode, lineCode) {
  return get(`/Previsao?codigoParada=${stopCode}&codigoLinha=${lineCode}`);
}
