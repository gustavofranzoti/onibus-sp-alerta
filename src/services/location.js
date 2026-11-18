import * as Location from 'expo-location';

/** Pede permissão de GPS (se necessário). Retorna true se concedida. */
export async function ensureLocationPermission() {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Location.requestForegroundPermissionsAsync();
  return asked.granted;
}

/** Lê a posição atual do usuário. Lança erro com mensagem amigável se não for possível. */
export async function getCurrentCoords() {
  const granted = await ensureLocationPermission();
  if (!granted) {
    throw new Error('Permissão de localização negada. Ative o GPS nas configurações do celular.');
  }
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
}

/**
 * A SPTrans abrevia endereços ("R MANOEL COELHO"), então "Rua Manoel Coelho"
 * pode não achar nada. Gera termos de busca do mais específico ao mais amplo.
 */
export function buildSearchTerms(street) {
  const prefixes = /^(rua|r\.?|avenida|av\.?|alameda|al\.?|travessa|tv\.?|estrada|est\.?|praça|pça\.?|largo|rodovia|rod\.?)\s+/i;
  const core = street.replace(prefixes, '').trim();
  const words = core.split(/\s+/).filter((w) => w.length > 2);
  const terms = [street, core];
  if (words.length > 1) terms.push(words.slice(0, 2).join(' '), words[words.length - 1]);
  return [...new Set(terms.filter(Boolean))];
}

/** Descobre o nome da rua em que o usuário está, para buscar pontos por perto. */
export async function getStreetName({ latitude, longitude }) {
  const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
  return place?.street ?? place?.name ?? null;
}