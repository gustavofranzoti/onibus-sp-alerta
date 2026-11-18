import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import NearbyScreen from './src/screens/NearbyScreen';
import StopScreen from './src/screens/StopScreen';
import { colors, fontSize, spacing } from './src/theme';

export default function App() {
  const [selectedStop, setSelectedStop] = useState(null);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Ônibus SP Alerta</Text>
      </View>
      {selectedStop ? (
        <StopScreen stop={selectedStop} onBack={() => setSelectedStop(null)} />
      ) : (
        <NearbyScreen onSelectStop={setSelectedStop} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  title: { color: colors.text, fontSize: fontSize.big, fontWeight: '800' },
});
