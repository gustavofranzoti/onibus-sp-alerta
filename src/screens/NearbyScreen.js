import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Button from '../components/Button';
import Credits from '../components/Credits';
import { MAX_NEARBY_STOPS } from '../config';
import { buildSearchTerms, getCurrentCoords, getStreetName } from '../services/location';
import { searchStops } from '../services/olhoVivo';
import { distanceInMeters, formatDistance } from '../utils/geo';
import { colors, fontSize, spacing } from '../theme';

export default function NearbyScreen({ onSelectStop }) {
  const [stops, setStops] = useState([]);
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Toque em "Pontos perto de mim" para começar.');

  async function run(task) {
    setLoading(true);
    setMessage(null);
    try {
      await task();
    } catch (e) {
      setStops([]);
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  }

  const findNearby = () =>
    run(async () => {
      const coords = await getCurrentCoords();
      const street = await getStreetName(coords);
      if (!street) throw new Error('Não consegui identificar a rua. Use a busca manual.');

      let found = [];
      for (const term of buildSearchTerms(street)) {
        found = await searchStops(term);
        if (found.length > 0) break;
      }
      const withDistance = found
        .map((s) => ({
          ...s,
          distance: distanceInMeters(coords.latitude, coords.longitude, s.py, s.px),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, MAX_NEARBY_STOPS);

      setStops(withDistance);
      if (withDistance.length === 0) setMessage(`Nenhum ponto encontrado em "${street}".`);
    });

  const searchManually = () =>
    run(async () => {
      if (!term.trim()) throw new Error('Digite um nome de rua ou local.');
      const found = await searchStops(term.trim());
      setStops(found.slice(0, MAX_NEARBY_STOPS));
      if (found.length === 0) setMessage('Nenhum ponto encontrado para essa busca.');
    });

  return (
    <View style={styles.container}>
      <Button title="Pontos perto de mim" onPress={findNearby} disabled={loading} />

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={term}
          onChangeText={setTerm}
          placeholder="Ou busque por rua (ex.: Paulista)"
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          onSubmitEditing={searchManually}
          accessibilityLabel="Buscar ponto por nome ou endereço"
        />
        <Button title="Buscar" variant="secondary" onPress={searchManually} disabled={loading} />
      </View>

      {loading && <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />}
      {message && <Text style={styles.message}>{message}</Text>}

      <FlatList
        data={stops}
        keyExtractor={(item) => String(item.cp)}
        ListFooterComponent={Credits}
        renderItem={({ item }) => (
          <Pressable
            style={styles.stop}
            onPress={() => onSelectStop(item)}
            accessibilityRole="button"
            accessibilityLabel={`Ponto ${item.np}`}
          >
            <Text style={styles.stopName}>{item.np}</Text>
            <Text style={styles.stopAddress}>{item.ed}</Text>
            {item.distance !== undefined && (
              <Text style={styles.stopDistance}>{formatDistance(item.distance)} de você</Text>
            )}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, gap: spacing.md },
  searchRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  input: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: fontSize.body,
  },
  loader: { marginVertical: spacing.sm },
  message: { color: colors.muted, fontSize: fontSize.body },
  stop: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stopName: { color: colors.text, fontSize: fontSize.body, fontWeight: '700' },
  stopAddress: { color: colors.muted, fontSize: fontSize.small, marginTop: spacing.xs },
  stopDistance: { color: colors.accent, fontSize: fontSize.small, marginTop: spacing.xs },
});