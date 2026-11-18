import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const CHANNEL_ID = 'bus-alerts';

// Mostra a notificação mesmo com o app aberto.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let channelReady = false;

async function ensureChannel() {
  if (Platform.OS !== 'android' || channelReady) return;
  try {
    // Só o essencial: opções extras podem falhar em algumas versões do Expo Go.
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Alertas de ônibus',
      importance: Notifications.AndroidImportance.HIGH,
    });
    channelReady = true;
  } catch (e) {
    console.warn('Não foi possível criar o canal de notificação:', e?.message);
  }
}

/** Pede permissão de notificação. Retorna true se concedida. Nunca lança erro. */
export async function ensureNotificationPermission() {
  try {
    await ensureChannel();
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch (e) {
    console.warn('Falha ao pedir permissão de notificação:', e?.message);
    return false;
  }
}

/** Dispara uma notificação local imediata. Retorna false se não foi possível. */
export async function notifyNow(title, body) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: channelReady ? { channelId: CHANNEL_ID } : null,
    });
    return true;
  } catch (e) {
    console.warn('Falha ao enviar notificação:', e?.message);
    return false;
  }
}