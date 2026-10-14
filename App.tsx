// App.tsx — Punto de entrada de la aplicación
//
// Este es el primer archivo que React Native ejecuta cuando abre la app.
// Su única responsabilidad es configurar los proveedores globales
// y renderizar el navegador principal.
//
// Conceptos clave:
// - SafeAreaProvider: Le dice a la app cómo manejar el "notch" y la barra de inicio
// - StatusBar: Controla el color y estilo de la barra de estado del teléfono

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';

export default function App() {
  return (
    // SafeAreaProvider SIEMPRE va en el nivel más alto de la app.
    // Sin esto, el contenido podría quedar detrás del notch del iPhone
    // o de la barra de navegación de Android.
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          {/* StatusBar controla si los íconos de la barra (hora, batería, wifi)
              son claros u oscuros. "dark" significa íconos oscuros sobre fondo claro. */}
          <StatusBar style="dark" backgroundColor="#f0ffd8" />

          {/* AppNavigator es quien decide qué pantalla mostrar */}
          <AppNavigator />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
