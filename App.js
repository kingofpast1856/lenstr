import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts, Orbitron_400Regular, Orbitron_700Bold } from '@expo-google-fonts/orbitron';
import { Rajdhani_500Medium, Rajdhani_700Bold } from '@expo-google-fonts/rajdhani';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { COLORS } from './src/theme/colors';

const Tab = createBottomTabNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Orbitron_400Regular,
    Orbitron_700Bold,
    Rajdhani_500Medium,
    Rajdhani_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.orange} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor={COLORS.bg} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: COLORS.bgCard,
              borderTopColor: COLORS.border,
              borderTopWidth: 1,
              height: 72,
              paddingBottom: 12,
              paddingTop: 8,
            },
            tabBarActiveTintColor: COLORS.orange,
            tabBarInactiveTintColor: COLORS.textMuted,
            tabBarLabelStyle: {
              fontFamily: 'Rajdhani_700Bold',
              fontSize: 11,
              letterSpacing: 1.5,
            },
          }}
        >
          <Tab.Screen
            name="Tara"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <TabIcon emoji="🔍" color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Geçmiş"
            component={HistoryScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <TabIcon emoji="🕐" color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Ayarlar"
            component={SettingsScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <TabIcon emoji="⚙️" color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

function TabIcon({ emoji, color }) {
  return (
    <View style={{ opacity: color === COLORS.orange ? 1 : 0.4 }}>
      <React.Text style={{ fontSize: 22 }}>{emoji}</React.Text>
    </View>
  );
}
