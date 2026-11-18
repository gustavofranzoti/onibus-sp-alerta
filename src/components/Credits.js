import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../theme';

export default function Credits() {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>Dados de localização e previsão: SPTrans / API Olho Vivo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { paddingVertical: spacing.md, alignItems: 'center' },
  text: { color: colors.muted, fontSize: fontSize.small, textAlign: 'center' },
});
