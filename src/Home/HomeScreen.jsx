import React, { useContext, useState, useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Linking,
  Platform,
  BackHandler,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// **images
var background = require("../../assets/images/background.png");
var Icon = require("../../assets/images/OGLogo.png");
var noInternet = require("../../assets/images/NoConnection.png");

// **components
import CustomTextInput from "../Components/CustomTextInput";
import { AuthContext } from "../Context/AuthContext";
import { WebView } from "react-native-webview";
import LoadingModal from "../Components/LoadingModal";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DismissKeyboard = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);

const HomeScreen = () => {
  const {
    isConnected,
    Login,
    webViewLink,
    webLoading,
    setWebLoading,
    loading,
  } = useContext(AuthContext);

  const [isKeyboardOpen, setKeyboardOpen] = useState(false);
  const webViewRef = React.useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (webLoading) {
      const timer = setTimeout(() => {
        console.log("done");
        setWebLoading(false);
      }, 14000);

      return () => clearTimeout(timer);
    }
  }, [webLoading]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleAndroidBackPress
    );

    return () => backHandler.remove();
  }, [canGoBack]);

  const handleAndroidBackPress = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
      return true;
    } else if (!canGoBack) {
      BackHandler.exitApp();
      return true;
    }
    return false;
  };

  const handleNavigationStateChange = (navState) => {
    const navStateLink = navState.url;

    let secureLink = navStateLink.startsWith("http://")
      ? navStateLink.replace("http://", "https://")
      : navStateLink;

    AsyncStorage.setItem("link", secureLink);
    setCanGoBack(navState.canGoBack);
  };

  useEffect(() => {
    let keyboardShowListener;
    let keyboardHideListener;

    if (Platform.OS === "ios") {
      keyboardShowListener = Keyboard.addListener(
        "keyboardWillShow",
        _handleKeyboardShow
      );
      keyboardHideListener = Keyboard.addListener(
        "keyboardWillHide",
        _handleKeyboardHide
      );
    } else {
      keyboardShowListener = Keyboard.addListener(
        "keyboardDidShow",
        _handleKeyboardShow
      );
      keyboardHideListener = Keyboard.addListener(
        "keyboardDidHide",
        _handleKeyboardHide
      );
    }

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  const _handleKeyboardShow = () => {
    setKeyboardOpen(true);
  };

  const _handleKeyboardHide = () => {
    setKeyboardOpen(false);
  };

  function Refresh() {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  }

  console.log("webViewLink:", webViewLink);

  return (
    <ImageBackground source={background} style={{ flex: 1 }}>
      {isConnected ? (
        !webViewLink ? (
          <>
            <LoadingModal visible={loading} />
            <DismissKeyboard>
              <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                  <View style={styles.row}>
                    <Text style={styles.logoTextStyle}>Expecting </Text>
                    <Image source={Icon} style={{ width: 42, height: 42 }} />
                  </View>
                  <Text style={styles.welcomeText}>
                    Welcome to Expecting Plus, your maternity health companion.
                  </Text>
                </View>

                <View style={styles.codeAreaContainer}>
                  <Text style={styles.titleText}>
                    Enter the access code provided to you
                  </Text>

                  <CustomTextInput />

                  <TouchableOpacity onPress={Login}>
                    <Text style={styles.alreadyUserText}>
                      Already an app user? Log in here
                    </Text>
                  </TouchableOpacity>
                </View>

                {!isKeyboardOpen && (
                  <TouchableOpacity
                    style={styles.emailLinkcontainer}
                    onPress={() =>
                      Linking.openURL("mailto:help@lifeeventsinc.com?")
                    }
                  >
                    <Text style={styles.needhelpText}>
                      Need help signing in? Send us a note at:
                    </Text>
                    <Text style={styles.needhelpText2}>
                      help@lifeeventsinc.com
                    </Text>
                  </TouchableOpacity>
                )}
              </SafeAreaView>
            </DismissKeyboard>
          </>
        ) : (
          <SafeAreaView style={{ flex: 1 }}>
            <LoadingModal visible={webLoading} />
            <WebView
              source={{
                uri: webViewLink.startsWith("http://")
                  ? webViewLink.replace("http://", "https://")
                  : webViewLink,
              }}
              ref={webViewRef}
              style={{ flex: 1 }}
              onLoadStart={() => {
                setWebLoading(true);
              }}
              onLoadEnd={() => {
                setWebLoading(false);
              }}
              onLoad={() => {
                setWebLoading(false);
              }}
              onLoadProgress={() => {
                setWebLoading(true);
              }}
              onNavigationStateChange={handleNavigationStateChange}
              allowsBackForwardNavigationGestures={true}
              onError={() => {
                Toast.show({
                  type: "error",
                  text1: "Network Error",
                  text2: "Error connecting to the internet. Please try again.",
                });
                setWebLoading(false);
                if (webViewRef.current) {
                  webViewRef.current.reload();
                }
              }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              sharedCookiesEnabled={true}
            />
          </SafeAreaView>
        )
      ) : (
        <SafeAreaView style={styles.noInternetContainer}>
          <Image source={noInternet} style={{ height: 120, width: 120 }} />

          <View>
            <Text style={styles.connectionLostText}>Connection lost</Text>
            <TouchableOpacity style={styles.refreshBtn} onPress={Refresh}>
              <Text style={styles.refreshBtnText}>
                {isRefreshing ? (
                  <ActivityIndicator size={"small"} color={"white"} />
                ) : (
                  "Refresh"
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  header: { marginTop: 16, gap: 16, alignItems: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
  },
  logoTextStyle: {
    fontFamily: "Bold",
    color: "#4785CF",
    fontSize: 28,
  },
  welcomeText: {
    fontFamily: "Medium",
    color: "#4785CF",
    fontSize: 14,
    textAlign: "center",
    width: "92%",
  },
  codeAreaContainer: {
    width: "92%",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 40,
    gap: 16,
  },
  titleText: {
    fontFamily: "Medium",
    fontSize: 14,
    color: "#4785CF",
    alignSelf: "center",
  },
  alreadyUserText: {
    fontFamily: "Medium",
    fontSize: 12,
    color: "#4785CF",
    alignSelf: "center",
    textAlign: "center",
    borderBottomWidth: 1,
    borderColor: "#4785CF",
  },
  needhelpText: {
    fontFamily: "SemiBold",
    fontSize: 14,
    color: "#27579D",
    textAlign: "center",
  },
  needhelpText2: {
    fontFamily: "SemiBold",
    fontSize: 14,
    color: "#27579D",
    textAlign: "center",
    alignSelf: "center",
    borderBottomWidth: 1,
    borderColor: "#4785CF",
  },
  emailLinkcontainer: {
    alignSelf: "center",
    position: "absolute",
    bottom: 48,
  },
  noInternetContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 48,
  },
  refreshBtn: {
    backgroundColor: "#4785CF",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    width: 120,
  },
  refreshBtnText: {
    color: "white",
    fontFamily: "SemiBold",
    fontSize: 16,
    letterSpacing: 1,
  },
  connectionLostText: {
    fontSize: 14,
    color: "#27579D",
    textAlign: "center",
    fontFamily: "SemiBold",
    alignSelf: "center",
    marginBottom: 16,
  },
});

export default HomeScreen;
