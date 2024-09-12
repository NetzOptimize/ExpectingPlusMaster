import React, { createContext, useState, useEffect } from "react";
import { Linking, ToastAndroid } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";

const BASE_URL = "https://expectingplus.com/wp-json/site/url";

export const AuthContext = createContext();

import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export const AuthProvider = ({ children }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [webLoading, setWebLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [webViewLink, setWebViewLink] = useState(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    retrieveData();
  }, []);

  const retrieveData = async () => {
    try {
      const storedLink = await AsyncStorage.getItem("link");
      if (storedLink !== null) {
        setWebLoading(true);
        setWebViewLink(storedLink);
        SplashScreen.hideAsync();
      } else {
        console.log("No link found.");
        SplashScreen.hideAsync();
      }
    } catch (error) {
      SplashScreen.hideAsync();
      console.error("Error retrieving data: ", error);
    }
  };

  function Login() {
    setWebLoading(true);
    const loginLink = "https://expectingplus.com/login/";
    AsyncStorage.setItem("link", loginLink).then(() => {
      setWebViewLink(loginLink);
    });
  }

  async function SubmitCode(code) {
    const url = BASE_URL;
    setWebLoading(true);
    setLoading(true);
    const TIMEOUT_DURATION = 10000;

    try {
      const response = await axios.get(url, {
        params: {
          code: code,
        },
        timeout: TIMEOUT_DURATION,
      });

      setCode("");
      setLoading(false);
      const codeGeneratedLink = response.data.site_url + "?regcode=" + code;

      let secureLink = codeGeneratedLink.startsWith("http://")
        ? codeGeneratedLink.replace("http://", "https://")
        : codeGeneratedLink;

      AsyncStorage.setItem("link", secureLink).then(() => {
        setWebViewLink(secureLink);
      });
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request was canceled");
      } else if (error.code === "ECONNABORTED") {
        console.log("Request timeout");
        ToastAndroid.show(
          "Request timed out. Please check your internet connection.",
          ToastAndroid.LONG
        );
      } else if (error.response) {
        console.log("Server Error varun", error.response.data);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response.data.data.error,
        });
      } else if (error.request) {
        console.log("No response received");
        Toast.show({
          type: "error",
          text1: "Network Error",
          text2: "Error connecting to the internet. Please try again.",
        });
      } else {
        console.log("Error", error.message);
      }

      setLoading(false);
      setWebLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        code,
        setCode,
        isConnected,
        Login,
        webViewLink,
        setWebLoading,
        webLoading,
        loading,
        SubmitCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
