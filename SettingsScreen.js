import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Linking } from 'react-native';
import { COLORS } from '../theme/colors';

export default function SettingsScreen() {
  const [haptics, setHaptics] = useState(true);
  const [autoSearch, setAutoSearch] = useState(true);

  const Row = ({ label, desc, value, onValueChange, isSwitch, onPress }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.rowInfo}>
        <Text style={styles.rowLabel}>{label}</Text>
        {desc && <Text style={styles.rowDesc}>{desc}</Text>}
      </View>
      {isSwitch && <Switch value={value} onValueChange={onValueChange} trackColor={{ true: COLORS.orange, false: COLORS.metal }} thumbColor={COLORS.textPrimary} />}
      {onPress && <Text style={styles.rowArrow}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>AYARLAR</Text>
        <Text style={styles.subtitle}>KİŞİSELLEŞTİR</Text>

        <Text style={styles.sectionHeader}>UYGULAMA</Text>
        <View style={styles.card}>
          <Row label="Titreşim" desc="Buton geri bildirimi" value={haptics} onValueChange={setHaptics} isSwitch />
          <View style={styles.divider} />
          <Row label="Otomatik Arama" desc="Fotoğraf seçince hemen tara" value={autoSearch} onValueChange={setAutoSearch} isSwitch />
        </View>

        <Text style={styles.sectionHeader}>API AYARLARI</Text>
        <View style={styles.card}>
          <Row label="Google Vision API Key" desc="Gerçek analiz için gerekli" onPress={() => {}} />
        </View>

        <View style={styles.apiInfo}>
          <Text style={styles.apiInfoTitle}>⚡ API KEY NASIL ALINIR?</Text>
          <Text style={styles.apiInfoText}>
            1. console.cloud.google.com adresine git{'\n'}
            2. "Vision AI" servisini etkinleştir{'\n'}
            3. API key oluştur{'\n'}
            4. searchService.js dosyasına yapıştır
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://console.cloud.google.com')}>
            <Text style={styles.apiLink}>console.cloud.google.com ›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>LENSTR v1.0.0 — Asiimov Edition</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 24, paddingTop: 60 },
  title: { fontFamily: 'Orbitron_700Bold', fontSize: 28, color: COLORS.orange, letterSpacing: 6 },
  subtitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 11, color: COLORS.textMuted, letterSpacing: 4, marginBottom: 32 },
  sectionHeader: { fontFamily: 'Rajdhani_700Bold', fontSize: 11, color: COLORS.textMuted, letterSpacing: 3, marginBottom: 10, marginTop: 8 },
  card: { backgroundColor: COLORS.bgCard, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  rowInfo: { flex: 1 },
  rowLabel: { fontFamily: 'Rajdhani_700Bold', fontSize: 15, color: COLORS.textPrimary },
  rowDesc: { fontFamily: 'Rajdhani_500Medium', fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  rowArrow: { fontSize: 22, color: COLORS.orange, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 },
  apiInfo: { backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 18, borderLeftWidth: 3, borderLeftColor: COLORS.orange, borderWidth: 1, borderColor: COLORS.border, marginBottom: 40 },
  apiInfoTitle: { fontFamily: 'Orbitron_700Bold', fontSize: 11, color: COLORS.orange, letterSpacing: 2, marginBottom: 12 },
  apiInfoText: { fontFamily: 'Rajdhani_500Medium', fontSize: 13, color: COLORS.textSecondary, lineHeight: 22 },
  apiLink: { fontFamily: 'Rajdhani_700Bold', fontSize: 14, color: COLORS.orange, marginTop: 12 },
  version: { fontFamily: 'Orbitron_400Regular', fontSize: 10, color: COLORS.textMuted, letterSpacing: 2, textAlign: 'center' },
});
