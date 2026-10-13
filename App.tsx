// App.tsx — Punto de entrada de la aplicación
//
// Este es el primer archivo que React Native ejecuta cuando abre la app.
// Su única responsabilidad es configurar los proveedores globales
// y renderizar el navegador principal.
//
// Conceptos clave:
// - SafeAreaProvider: Le dice a la app cómo manejar el "notch" y la barra de inicio
// - StatusBar: Controla el color y estilo de la barra de estado del teléfono
// - AuthProvider: Provee el estado de autenticación a toda la app (T02)

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  return (
    // SafeAreaProvider SIEMPRE va en el nivel más alto de la app.
    // Sin esto, el contenido podría quedar detrás del notch del iPhone
    // o de la barra de navegación de Android.
    <SafeAreaProvider>
      {/* StatusBar controla si los íconos de la barra (hora, batería, wifi)
          son claros u oscuros. "dark" significa íconos oscuros sobre fondo claro. */}
      <StatusBar style="dark" backgroundColor="#f0ffd8" />

      {/* AuthProvider envuelve al navegador para que useAuth() esté
          disponible en todas las pantallas. Debe ir DENTRO de SafeAreaProvider
          pero FUERA de NavigationContainer. */}
      <AuthProvider>
        {/* AppNavigator es quien decide qué pantalla mostrar */}
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
