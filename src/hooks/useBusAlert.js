import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Vibration } from 'react-native';
import { POLL_INTERVAL_MS } from '../config';
import { getLineArrivals } from '../services/olhoVivo';
import { notifyNow } from '../services/notifications';
import { parseNextVehicleMinutes } from '../utils/arrivals';

/**
 * Monitora uma linha em um ponto e avisa (notificação + vibração + Alert)
 * quando faltar pouco para o ônibus chegar.
 *
 * config = { stop, line, threshold, walkMinutes }
 * O aviso dispara quando minutosAteChegar <= threshold + walkMinutes.
 * Com walkMinutes > 0 funciona como "Hora de sair".
 */
export function useBusAlert() {
  const [config, setConfig] = useState(null);
  const [eta, setEta] = useState(null);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    setConfig(null);
    setEta(null);
  }, [clearTimer]);

  const check = useCallback(
    async (cfg) => {
      try {
        const data = await getLineArrivals(cfg.stop.cp, cfg.line.code);
        const minutes = parseNextVehicleMinutes(data);
        setError(null);
        setEta(minutes);
        if (minutes === null || minutes > cfg.threshold + cfg.walkMinutes) return;

        const leaveNow = cfg.walkMinutes > 0;
        const title = leaveNow ? 'Hora de sair!' : 'Seu ônibus está chegando!';
        const body = leaveNow
          ? `Linha ${cfg.line.id} chega em ${minutes} min e o ponto fica a ${cfg.walkMinutes} min a pé.`
          : `Linha ${cfg.line.id} chega em ${minutes} min em ${cfg.stop.np}.`;

        await notifyNow(title, body);
        Vibration.vibrate([0, 500, 300, 500]);
        Alert.alert(title, body);
        stop();
      } catch (e) {
        setError(e.message);
      }
    },
    [stop]
  );

  const start = useCallback(
    (cfg) => {
      clearTimer();
      setConfig(cfg);
      setEta(null);
      setError(null);
      check(cfg);
      timerRef.current = setInterval(() => check(cfg), POLL_INTERVAL_MS);
    },
    [check, clearTimer]
  );

  useEffect(() => clearTimer, [clearTimer]);

  return { config, eta, error, start, stop };
}
