import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../theme/colors';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>GEÇMİŞ</Text>
        <Text style={styles.subtitle}>ARAMA GEÇMİŞİN</Text>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🕐</Text>
          <Text style={styles.emptyText}>Henüz arama yapılmadı</Text>
          <Text style={styles.emptySubText}>
            Kameradan veya galeriden ürün taradıkça burada görünecek
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 24, paddingTop: 60 },
  title: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 28,
    color: COLORS.orange,
    letterSpacing: 6,
  },
  subtitle: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 4,
    marginBottom: 40,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: {
    fontFamily: 'Orbitron_400Regular',
    fontSize: 14,
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
  emptySubText: {
    fontFamily: 'Rajdhani_500Medium',
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
});
