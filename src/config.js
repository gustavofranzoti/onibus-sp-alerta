export const OLHOVIVO_BASE_URL = 'https://api.olhovivo.sptrans.com.br/v2.1';
export const OLHOVIVO_TOKEN = process.env.EXPO_PUBLIC_OLHOVIVO_TOKEN;

// Intervalo entre consultas de previsão enquanto o app está aberto.
export const POLL_INTERVAL_MS = 30 * 1000;

// Velocidade média de caminhada (metros por minuto) usada no "Hora de sair".
export const WALK_SPEED_M_PER_MIN = 80;

// Quantos pontos mostrar na lista de pontos próximos.
export const MAX_NEARBY_STOPS = 15;

// Opções de antecedência (em minutos) oferecidas ao usuário.
export const ALERT_THRESHOLDS = [3, 5, 10];
