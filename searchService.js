import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

// Google Vision API ile görsel analiz
// (Demo modda mock data döner, API key eklenince gerçek çalışır)
export async function analyzeImage(base64Image) {
  // Google Cloud Vision API
  const VISION_API_KEY = 'YOUR_GOOGLE_VISION_API_KEY'; // Buraya key gelecek

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: base64Image },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 5 },
              { type: 'WEB_DETECTION', maxResults: 10 },
              { type: 'LOGO_DETECTION', maxResults: 5 },
            ]
          }]
        })
      }
    );
    const data = await response.json();
    return parseVisionResponse(data);
  } catch (e) {
    // Demo modu - API key yokken
    return getDemoResults();
  }
}

function parseVisionResponse(data) {
  const response = data.responses?.[0];
  if (!response) return getDemoResults();

  const labels = response.labelAnnotations?.map(l => l.description) || [];
  const objects = response.localizedObjectAnnotations?.map(o => o.name) || [];
  const webEntities = response.webDetection?.webEntities?.map(e => e.description).filter(Boolean) || [];
  const logos = response.logoAnnotations?.map(l => l.description) || [];

  const searchTerms = [...new Set([...logos, ...objects, ...webEntities, ...labels])].slice(0, 5);
  const primaryTerm = searchTerms[0] || 'ürün';

  return {
    detected: primaryTerm,
    terms: searchTerms,
    confidence: response.labelAnnotations?.[0]?.score || 0.9,
    isDemo: false,
  };
}

function getDemoResults() {
  const demos = [
    { detected: 'Nike Air Force 1', terms: ['Nike', 'Air Force 1', 'Spor Ayakkabı', 'Beyaz Sneaker'], confidence: 0.94, isDemo: true },
    { detected: 'iPhone 15', terms: ['Apple iPhone', 'Akıllı Telefon', 'iOS', 'Apple'], confidence: 0.97, isDemo: true },
    { detected: 'Lego Technic', terms: ['Lego', 'Oyuncak', 'Technic', 'Yapı Seti'], confidence: 0.91, isDemo: true },
    { detected: 'Samsung 4K TV', terms: ['Samsung', 'Televizyon', '4K', 'QLED'], confidence: 0.88, isDemo: true },
  ];
  return demos[Math.floor(Math.random() * demos.length)];
}

// Trendyol arama URL'i
export function getTrendyolUrl(query) {
  return `https://www.trendyol.com/sr?q=${encodeURIComponent(query)}&qt=${encodeURIComponent(query)}&st=${encodeURIComponent(query)}`;
}

// Hepsiburada arama URL'i
export function getHepsiburadaUrl(query) {
  return `https://www.hepsiburada.com/ara?q=${encodeURIComponent(query)}`;
}

// Amazon TR arama URL'i
export function getAmazonUrl(query) {
  return `https://www.amazon.com.tr/s?k=${encodeURIComponent(query)}`;
}

// Sahibinden arama URL'i
export function getSahibindenUrl(query) {
  return `https://www.sahibinden.com/arama?query=${encodeURIComponent(query)}`;
}

// Google Shopping arama
export function getGoogleShoppingUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=shop`;
}

// Pinterest görsel arama
export function getPinterestUrl(query) {
  return `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
}

export async function openUrl(url) {
  await WebBrowser.openBrowserAsync(url, {
    toolbarColor: '#0a0a0a',
    controlsColor: '#FF6B1A',
  });
}

export const PLATFORMS = [
  {
    id: 'trendyol',
    name: 'Trendyol',
    emoji: '🛍️',
    color: '#F27A1A',
    getUrl: getTrendyolUrl,
    description: 'En ucuzu bul'
  },
  {
    id: 'hepsiburada',
    name: 'Hepsiburada',
    emoji: '🛒',
    color: '#FF6000',
    getUrl: getHepsiburadaUrl,
    description: 'Hızlı teslimat'
  },
  {
    id: 'amazon',
    name: 'Amazon TR',
    emoji: '📦',
    color: '#FF9900',
    getUrl: getAmazonUrl,
    description: 'Prime üyelik'
  },
  {
    id: 'sahibinden',
    name: 'Sahibinden',
    emoji: '🏷️',
    color: '#00A0E3',
    getUrl: getSahibindenUrl,
    description: 'İkinci el'
  },
  {
    id: 'google',
    name: 'Google Alışveriş',
    emoji: '🔍',
    color: '#4285F4',
    getUrl: getGoogleShoppingUrl,
    description: 'Fiyat karşılaştır'
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    emoji: '📌',
    color: '#E60023',
    getUrl: getPinterestUrl,
    description: 'Benzer görseller'
  },
];
