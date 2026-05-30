import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView,
  ActivityIndicator, Animated, Dimensions, StatusBar, Alert,
  TextInput, Platform, Vibration,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../theme/colors';
import { analyzeImage, PLATFORMS, openUrl } from '../services/searchService';

const { width, height } = Dimensions.get('window');

// Asiimov desen çizgileri (dekoratif)
function AsimovStripes() {
  const stripes = Array.from({ length: 8 });
  return (
    <View style={styles.stripesContainer} pointerEvents="none">
      {stripes.map((_, i) => (
        <View
          key={i}
          style={[
            styles.stripe,
            {
              top: 60 + i * 38,
              left: -20 + i * 12,
              width: 180 + i * 20,
              opacity: 0.04 + i * 0.005,
              transform: [{ rotate: '-35deg' }],
            }
          ]}
        />
      ))}
    </View>
  );
}

// Platform butonu
function PlatformButton({ platform, searchTerm, index }) {
  const scale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 50 }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  const onPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const url = platform.getUrl(searchTerm);
    await openUrl(url);
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={styles.platformBtn}
      >
        <View style={[styles.platformIconBox, { borderColor: platform.color + '60' }]}>
          <Text style={styles.platformEmoji}>{platform.emoji}</Text>
        </View>
        <View style={styles.platformInfo}>
          <Text style={styles.platformName}>{platform.name}</Text>
          <Text style={styles.platformDesc}>{platform.description}</Text>
        </View>
        <View style={[styles.platformArrow, { backgroundColor: platform.color + '20' }]}>
          <Text style={[styles.platformArrowText, { color: platform.color }]}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [manualSearch, setManualSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Tarama animasyonu
  const startScanAnimation = () => {
    scanAnim.setValue(0);
    Animated.loop(
      Animated.timing(scanAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopScanAnimation = () => {
    scanAnim.stopAnimation();
    glowAnim.stopAnimation();
  };

  // Fotoğraf çek
  const takePhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Kamera kullanmak için izin vermeniz gerekiyor.');
      return;
    }
    const picked = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!picked.canceled && picked.assets[0]) {
      processImage(picked.assets[0]);
    }
  };

  // Galeriden seç
  const pickFromGallery = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeri erişimi için izin vermeniz gerekiyor.');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!picked.canceled && picked.assets[0]) {
      processImage(picked.assets[0]);
    }
  };

  // Görüntü işle
  const processImage = async (asset) => {
    setImage(asset.uri);
    setResult(null);
    setLoading(true);
    startScanAnimation();

    try {
      const analysisResult = await analyzeImage(asset.base64);
      setResult(analysisResult);
      setActiveSearch(analysisResult.detected);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert('Hata', 'Görüntü analiz edilemedi. Tekrar deneyin.');
    } finally {
      setLoading(false);
      stopScanAnimation();
    }
  };

  // Manuel arama
  const doManualSearch = () => {
    if (!manualSearch.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveSearch(manualSearch.trim());
    setResult({ detected: manualSearch.trim(), terms: [manualSearch.trim()], confidence: 1, isDemo: false });
    setImage(null);
  };

  const scanLineY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <AsimovStripes />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logoText}>LENSTR</Text>
          <Text style={styles.tagline}>GÖRSEL ALIŞVERIŞ MOTORU</Text>
          <View style={styles.headerLine} />
        </View>

        {/* FOTOĞRAF ALANI */}
        <View style={styles.scanArea}>
          {image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              {loading && (
                <View style={styles.scanOverlay}>
                  <Animated.View
                    style={[
                      styles.scanLine,
                      { transform: [{ translateY: scanLineY }], opacity: glowOpacity }
                    ]}
                  />
                  <View style={styles.scanCornerTL} />
                  <View style={styles.scanCornerTR} />
                  <View style={styles.scanCornerBL} />
                  <View style={styles.scanCornerBR} />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyImage}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>ÜRÜN TARA</Text>
              <Text style={styles.emptySubText}>Fotoğraf çek veya galeriden seç</Text>
            </View>
          )}
        </View>

        {/* BUTONLAR */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.mainBtn} onPress={takePhoto} activeOpacity={0.8}>
            <Text style={styles.mainBtnIcon}>📷</Text>
            <Text style={styles.mainBtnText}>KAMERA</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.mainBtn, styles.mainBtnSecondary]} onPress={pickFromGallery} activeOpacity={0.8}>
            <Text style={styles.mainBtnIcon}>🖼️</Text>
            <Text style={styles.mainBtnText}>GALERİ</Text>
          </TouchableOpacity>
        </View>

        {/* MANUEL ARAMA */}
        <View style={styles.manualSection}>
          <Text style={styles.sectionLabel}>VEYA YAZARAK ARA</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Ürün adı yaz..."
              placeholderTextColor={COLORS.textMuted}
              value={manualSearch}
              onChangeText={setManualSearch}
              onSubmitEditing={doManualSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchBtn} onPress={doManualSearch} activeOpacity={0.8}>
              <Text style={styles.searchBtnText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SONUÇLAR */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.orange} />
            <Text style={styles.loadingText}>ANALİZ EDİLİYOR...</Text>
            <Text style={styles.loadingSubText}>Yapay zeka görüntüyü işliyor</Text>
          </View>
        )}

        {result && !loading && (
          <View style={styles.resultsSection}>
            {/* Tespit edilen ürün */}
            <View style={styles.detectedCard}>
              <View style={styles.detectedHeader}>
                <Text style={styles.detectedLabel}>TESPİT EDİLDİ</Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    %{Math.round(result.confidence * 100)} EŞLEŞME
                  </Text>
                </View>
              </View>
              <Text style={styles.detectedName}>{result.detected}</Text>

              {result.isDemo && (
                <Text style={styles.demoNote}>
                  ⚠️ Demo mod — Google Vision API key eklenince gerçek analiz yapılır
                </Text>
              )}

              {/* Arama terimleri */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
                {result.terms.map((term, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.tag, activeSearch === term && styles.tagActive]}
                    onPress={() => { setActiveSearch(term); Haptics.selectionAsync(); }}
                  >
                    <Text style={[styles.tagText, activeSearch === term && styles.tagTextActive]}>
                      {term}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Platform listesi */}
            <Text style={styles.platformsLabel}>PLATFORMLARDA ARA → "{activeSearch}"</Text>
            <View style={styles.platformsList}>
              {PLATFORMS.map((platform, i) => (
                <PlatformButton
                  key={platform.id}
                  platform={platform}
                  searchTerm={activeSearch}
                  index={i}
                />
              ))}
            </View>
          </View>
        )}

        {/* ALT BOŞLUK */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },

  // Asiimov çizgiler
  stripesContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden',
  },
  stripe: {
    position: 'absolute',
    height: 18,
    backgroundColor: COLORS.orange,
    borderRadius: 2,
  },

  // Header
  header: {
    marginBottom: 28,
    alignItems: 'flex-start',
  },
  logoText: {
    fontSize: 42,
    fontFamily: 'Orbitron_700Bold',
    color: COLORS.orange,
    letterSpacing: 6,
    textShadowColor: COLORS.orange,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  tagline: {
    fontSize: 10,
    fontFamily: 'Rajdhani_700Bold',
    color: COLORS.textSecondary,
    letterSpacing: 4,
    marginTop: -4,
  },
  headerLine: {
    marginTop: 12,
    width: '100%',
    height: 1,
    backgroundColor: COLORS.border,
  },

  // Scan area
  scanArea: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scanOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scanLine: {
    position: 'absolute',
    left: 0, right: 0,
    height: 2,
    backgroundColor: COLORS.orange,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  scanCornerTL: { position: 'absolute', top: 16, left: 16, width: 24, height: 24, borderTopWidth: 2, borderLeftWidth: 2, borderColor: COLORS.orange },
  scanCornerTR: { position: 'absolute', top: 16, right: 16, width: 24, height: 24, borderTopWidth: 2, borderRightWidth: 2, borderColor: COLORS.orange },
  scanCornerBL: { position: 'absolute', bottom: 16, left: 16, width: 24, height: 24, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: COLORS.orange },
  scanCornerBR: { position: 'absolute', bottom: 16, right: 16, width: 24, height: 24, borderBottomWidth: 2, borderRightWidth: 2, borderColor: COLORS.orange },

  emptyImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 16,
    color: COLORS.orange,
    letterSpacing: 4,
  },
  emptySubText: {
    fontFamily: 'Rajdhani_500Medium',
    fontSize: 13,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },

  // Butonlar
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  mainBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: COLORS.orange,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.orangeBright,
  },
  mainBtnSecondary: {
    backgroundColor: COLORS.metal,
    borderColor: COLORS.metalLight,
  },
  mainBtnIcon: { fontSize: 18 },
  mainBtnText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 12,
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },

  // Manuel arama
  manualSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 3,
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Rajdhani_500Medium',
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  searchBtn: {
    width: 52,
    backgroundColor: COLORS.orange,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: -4,
  },

  // Loading
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 14,
    color: COLORS.orange,
    letterSpacing: 3,
  },
  loadingSubText: {
    fontFamily: 'Rajdhani_500Medium',
    fontSize: 13,
    color: COLORS.textMuted,
  },

  // Sonuçlar
  resultsSection: {
    gap: 16,
  },
  detectedCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.orangeGlow,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orange,
  },
  detectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detectedLabel: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 3,
  },
  confidenceBadge: {
    backgroundColor: COLORS.orangeGlow,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.orange + '40',
  },
  confidenceText: {
    fontFamily: 'Orbitron_400Regular',
    fontSize: 9,
    color: COLORS.orange,
    letterSpacing: 1,
  },
  detectedName: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: 14,
    letterSpacing: 1,
  },
  demoNote: {
    fontFamily: 'Rajdhani_500Medium',
    fontSize: 12,
    color: COLORS.rust,
    marginBottom: 12,
    lineHeight: 18,
  },
  tagsScroll: {
    marginBottom: 4,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: COLORS.metal,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.metalLight,
  },
  tagActive: {
    backgroundColor: COLORS.orangeGlow,
    borderColor: COLORS.orange,
  },
  tagText: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 13,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  tagTextActive: {
    color: COLORS.orange,
  },

  // Platformlar
  platformsLabel: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  platformsList: {
    gap: 10,
  },
  platformBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  platformIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.metal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  platformEmoji: { fontSize: 22 },
  platformInfo: { flex: 1 },
  platformName: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 15,
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  platformDesc: {
    fontFamily: 'Rajdhani_500Medium',
    fontSize: 12,
    color: COLORS.textMuted,
  },
  platformArrow: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformArrowText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: -2,
  },
});
