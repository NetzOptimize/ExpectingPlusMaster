import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";

// **3rd party imports
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// **context
import { AuthProvider } from "./src/Context/AuthContext";

// **screen
import HomeScreen from "./src/Home/HomeScreen";

export default function App() {
  const [loaded, error] = useFonts({
    Light: require("./assets/fonts/OpenSans-Light.ttf"),
    Regular: require("./assets/fonts/OpenSans-Regular.ttf"),
    Medium: require("./assets/fonts/OpenSans-Medium.ttf"),
    SemiBold: require("./assets/fonts/OpenSans-SemiBold.ttf"),
    Bold: require("./assets/fonts/OpenSans-Bold.ttf"),
  });

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <HomeScreen />
        <StatusBar style="dark" />
        <Toast />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
