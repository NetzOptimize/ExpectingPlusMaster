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
  Button,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// **images
var background = require("../../assets/images/background.png");
var Icon = require("../../assets/images/OGLogo.png");
var noInternet = require("../../assets/images/NoConnection.png");

import LottieView from "lottie-react-native";

// **components
import CustomTextInput from "../Components/CustomTextInput";
import { AuthContext } from "../Context/AuthContext";
import { WebView } from "react-native-webview";
import LoadingModal from "../Components/LoadingModal";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as SplashScreen from "expo-splash-screen";

const DismissKeyboard = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);

const EXPECTINGPLUS_URL = "https://expectingplus.com";

const HomeScreen = () => {
  const {
    isConnected,
    Login,
    webViewLink,
    setWebViewLink,
    webLoading,
    setWebLoading,
    loading,
    setLoading,
  } = useContext(AuthContext);

  const [isKeyboardOpen, setKeyboardOpen] = useState(false);
  const webViewRef = React.useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastLink, setLastLink] = useState(EXPECTINGPLUS_URL);

  // useEffect(() => {
  //   if (webLoading) {
  //     const timer = setTimeout(() => {
  //       setWebLoading(false);
  //     }, 6000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [webLoading]);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [loading]);

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
    if (Platform.OS == "android" && !navState.loading) {
      setWebLoading(false);
    }

    const navStateLink = navState.url;

    let secureLink = navStateLink.startsWith("http://")
      ? navStateLink.replace("http://", "https://")
      : navStateLink;


    setWebViewLink(secureLink);

    if (secureLink && !secureLink.startsWith("blob:") && !( secureLink.startsWith(EXPECTINGPLUS_URL) && secureLink.includes("/download") )) {
      AsyncStorage.setItem("link", secureLink);
      setLastLink(secureLink);
    }

    setCanGoBack(navState.canGoBack);
  };

  const handleShouldStartLoadWithRequest = (request) => {
    const { url } = request;
    
    if (Platform.OS == "android") {
      return true;
    }

    if (!request.isTopFrame) {
      return true;
    }

    if (url.includes(".pdf")) {
      Linking.openURL(url).catch(() =>
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Unable to open PDF.",
        })
      );
      return false;
    }

    if (
      url.startsWith("blob:") ||
      (Platform.OS === "ios" && url.startsWith(EXPECTINGPLUS_URL) && url.includes("/download"))
    ) {
      Alert.alert("Feature Unavailable", "The download and export feature is currently unavailable in the app. Log in via your browser to proceed with downloading or exporting.", [
        {
          text: "Later",
          style: "cancel",
        },
        {
          text: "Login",
          onPress: () => {
            Linking.openURL(lastLink);
          },
        },
      ]);
      return false;
    }

    if (url.startsWith(EXPECTINGPLUS_URL) || url.startsWith("https://www.expectingplus.com")) {
      return true;
    }

    Linking.openURL(url).catch(async () => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Unable to open external link.",
        });
      
      return false;
    });

    return false;
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

  const handleMessage = (event) => {
    const data = event.nativeEvent.data;
    
    if (Platform.OS == "android" && data === 'export-button-clicked') {
      Alert.alert("Feature Unavailable", "The download and export feature is currently unavailable in the app. Log in via your browser to proceed with downloading or exporting.", [
        {
          text: "Later",
          style: "cancel",
        },
        {
          text: "Login",
          onPress: () => {
            Linking.openURL(lastLink);
          },
        },
      ]);
    }
  };

  const injectedJavaScript = `
    // Ensure listener is added only once
    if (!window.isClickListenerAdded) {
      window.isClickListenerAdded = true;

      // Observe all clicks in the document
      document.addEventListener('click', function(event) {
        const target = event.target;
        // Check if the clicked element is a button or contains a button ancestor
        const button = target.tagName === 'BUTTON' ? target : target.closest('button');
        if (button) {
          const buttonText = (button.textContent || button.innerText).trim().toLowerCase();

          // Check for specific text matches
          if (buttonText === 'loading...building export file' || buttonText === 'loading...construyendo archivo de exportación') {
            event.preventDefault(); // Prevent the default action
            if (!button.dataset.clicked) {
              button.dataset.clicked = true; // Prevent duplicate processing
              button.remove();
              window.ReactNativeWebView.postMessage('export-button-clicked');
            }
          }

          
        }
        
      });
    }
    true; // Required for injectedJavaScript to execute
  `;

  

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
            {webLoading && (
              <LottieView
                source={require("../../assets/webLoading.json")}
                style={{ height: 8, width: "100%" }}
                autoPlay
                loop={true}
              />
            )} 
            <WebView
              source={{
                uri: webViewLink,
              }}
              ref={webViewRef}
              style={{ flex: 1 }}
              onLoadStart={(e) => {
                // setWebLoading(true);
              }}
              onLoad={() => {
                setWebLoading(false);
                SplashScreen.hideAsync();
              }}
              onLoadEnd={() => {
                setWebLoading(false);
                SplashScreen.hideAsync();
              }}
              onMessage={() => {
                console.log('s')
                handleMessage()
              }}
              onNavigationStateChange={handleNavigationStateChange}
              allowsBackForwardNavigationGestures={true}
              onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
              onError={(e) => {
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
              originWhitelist={['*']}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              sharedCookiesEnabled={true}
              injectedJavaScript={injectedJavaScript}
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
    color: "#4785CF",
    textAlign: "center",
  },
  emailLinkcontainer: {
    marginTop: "auto",
    marginBottom: 30,
  },
  noInternetContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  connectionLostText: {
    fontFamily: "Medium",
    fontSize: 14,
    color: "#4785CF",
    alignSelf: "center",
  },
  refreshBtn: {
    backgroundColor: "#4785CF",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 10,
  },
  refreshBtnText: {
    color: "white",
    fontFamily: "Medium",
  },
  goHome: {
    fontFamily: "Bold",
    color: "#4785CF",
    fontSize: 22,
  },
  goHomeButton: {
    paddingLeft: 8,
    paddingRight: 8,
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 2,
    borderColor: "#4785CF",
  },
});

export default HomeScreen;
