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

/** Pede permissão de notificação e cria o canal no Android. Retorna true se concedida. */
export async function ensureNotificationPermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Alertas de ônibus',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 400, 250, 400],
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/** Dispara uma notificação local imediata. */
export function notifyNow(title, body) {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: Platform.OS === 'android' ? { channelId: CHANNEL_ID } : null,
  });
}
