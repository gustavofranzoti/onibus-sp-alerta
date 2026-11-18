import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, spacing } from '../theme';

export default function Button({ title, onPress, variant = 'primary', disabled }) {
  const secondary = variant === 'secondary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        secondary ? styles.secondary : styles.primary,
        (pressed || disabled) && { opacity: 0.6 },
      ]}
    >
      <Text style={[styles.text, secondary && { color: colors.accent }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.accent },
  secondary: { borderWidth: 2, borderColor: colors.accent },
  text: { fontSize: fontSize.body, fontWeight: '700', color: colors.onAccent },
});
