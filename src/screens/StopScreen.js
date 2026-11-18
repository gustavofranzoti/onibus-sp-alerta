import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Credits from '../components/Credits';
import { ALERT_THRESHOLDS, POLL_INTERVAL_MS } from '../config';
import { useBusAlert } from '../hooks/useBusAlert';
import { getCurrentCoords } from '../services/location';
import { ensureNotificationPermission } from '../services/notifications';
import { getStopArrivals } from '../services/olhoVivo';
import { parseStopArrivals } from '../utils/arrivals';
import { distanceInMeters, formatDistance, walkingMinutes } from '../utils/geo';
import { colors, fontSize, spacing } from '../theme';

export default function StopScreen({ stop, onBack }) {
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedLine, setSelectedLine] = useState(null);
  const [threshold, setThreshold] = useState(ALERT_THRESHOLDS[0]);
  const [leaveMode, setLeaveMode] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const alert = useBusAlert();

  const loadArrivals = useCallback(async () => {
    try {
      const data = await getStopArrivals(stop.cp);
      setLines(parseStopArrivals(data));
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [stop.cp]);

  useEffect(() => {
    loadArrivals();
    const id = setInterval(loadArrivals, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loadArrivals]);

  async function activateAlert() {
    setFeedback(null);
    if (!selectedLine) return;

    const notificationsOk = await ensureNotificationPermission();
    if (!notificationsOk) {
      setFeedback('Notificações desativadas: você receberá apenas o alerta dentro do app.');
    }

    let walkMinutes = 0;
    if (leaveMode) {
      try {
        const coords = await getCurrentCoords();
        const meters = distanceInMeters(coords.latitude, coords.longitude, stop.py, stop.px);
        walkMinutes = walkingMinutes(meters);
        setFeedback(`Você está a ${formatDistance(meters)} do ponto (~${walkMinutes} min a pé).`);
      } catch (e) {
        setFeedback(`${e.message} O alerta usará só a antecedência escolhida.`);
      }
    }

    alert.start({ stop, line: selectedLine, threshold, walkMinutes });
  }

  const monitoring = alert.config !== null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="← Voltar" variant="secondary" onPress={onBack} />

      <Text style={styles.stopName}>{stop.np}</Text>
      <Text style={styles.stopAddress}>{stop.ed}</Text>

      <Text style={styles.section}>Próximos ônibus</Text>
      {loading && <ActivityIndicator size="large" color={colors.accent} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {!loading && !error && lines.length === 0 && (
        <Text style={styles.muted}>Nenhuma previsão disponível agora.</Text>
      )}

      {lines.map((line) => {
        const selected = selectedLine?.code === line.code;
        return (
          <Pressable
            key={line.code}
            onPress={() => setSelectedLine(line)}
            disabled={monitoring}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Linha ${line.id} para ${line.destination}`}
            style={[styles.line, selected && styles.lineSelected]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.lineId}>{line.id}</Text>
              <Text style={styles.muted}>{line.destination}</Text>
            </View>
            <View style={styles.times}>
              {line.vehicles.slice(0, 3).map((v, i) => (
                <Text key={i} style={styles.time}>
                  {v.minutes} min{v.accessible ? ' ♿' : ''}
                </Text>
              ))}
            </View>
          </Pressable>
        );
      })}

      {selectedLine && (
        <View style={styles.panel}>
          <Text style={styles.section}>Alerta para a linha {selectedLine.id}</Text>

          <Text style={styles.muted}>Avisar quando faltarem:</Text>
          <View style={styles.chips}>
            {ALERT_THRESHOLDS.map((t) => (
              <Pressable
                key={t}
                onPress={() => setThreshold(t)}
                disabled={monitoring}
                accessibilityRole="button"
                accessibilityState={{ selected: threshold === t }}
                style={[styles.chip, threshold === t && styles.chipSelected]}
              >
                <Text style={[styles.chipText, threshold === t && { color: colors.onAccent }]}>
                  {t} min
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => setLeaveMode((v) => !v)}
            disabled={monitoring}
            accessibilityRole="switch"
            accessibilityState={{ checked: leaveMode }}
            style={styles.toggle}
          >
            <Text style={styles.toggleBox}>{leaveMode ? '☑' : '☐'}</Text>
            <Text style={styles.toggleText}>
              Hora de sair: somar o tempo de caminhada até o ponto (usa o GPS)
            </Text>
          </Pressable>

          {monitoring ? (
            <>
              <Text style={styles.status}>
                Monitorando linha {alert.config.line.id}…{' '}
                {alert.eta !== null ? `próximo ônibus em ${alert.eta} min` : 'aguardando previsão'}
              </Text>
              <Button title="Cancelar alerta" variant="secondary" onPress={alert.stop} />
            </>
          ) : (
            <Button title="Ativar alerta" onPress={activateAlert} />
          )}

          {feedback && <Text style={styles.muted}>{feedback}</Text>}
          {alert.error && <Text style={styles.error}>{alert.error}</Text>}
          <Text style={styles.hint}>
            Mantenha o app aberto: a previsão é consultada a cada {POLL_INTERVAL_MS / 1000} s.
          </Text>
        </View>
      )}

      <Credits />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.sm },
  stopName: { color: colors.text, fontSize: fontSize.title, fontWeight: '800' },
  stopAddress: { color: colors.muted, fontSize: fontSize.body },
  section: { color: colors.accent, fontSize: fontSize.body, fontWeight: '700', marginTop: spacing.md },
  muted: { color: colors.muted, fontSize: fontSize.small },
  error: { color: colors.danger, fontSize: fontSize.body },
  line: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  lineSelected: { borderColor: colors.accent },
  lineId: { color: colors.text, fontSize: fontSize.title, fontWeight: '800' },
  times: { alignItems: 'flex-end', justifyContent: 'center' },
  time: { color: colors.text, fontSize: fontSize.body, fontWeight: '600' },
  panel: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chips: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: colors.accent },
  chipText: { color: colors.accent, fontSize: fontSize.body, fontWeight: '700' },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 48 },
  toggleBox: { color: colors.accent, fontSize: fontSize.big },
  toggleText: { flex: 1, color: colors.text, fontSize: fontSize.small },
  status: { color: colors.success, fontSize: fontSize.body, fontWeight: '600' },
  hint: { color: colors.muted, fontSize: fontSize.small },
});
