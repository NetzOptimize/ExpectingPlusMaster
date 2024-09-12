import React, { useContext } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Image,
} from "react-native";
import { AuthContext } from "../Context/AuthContext";
import Toast from "react-native-toast-message";

var next = require("../../assets/images/next.png");

const CustomTextInput = ({}) => {
  const { code, setCode, SubmitCode } = useContext(AuthContext);

  function handleSubmit() {
    if (code.trim() == "") {
      Toast.show({
        type: "info",
        text1: "Invalid Code",
        text2: "Please submit a valid code.",
      });
    } else {
      SubmitCode(code.trim());
    }
  }

  return (
    <View style={styles.inputBox}>
      <TextInput
        placeholder="Enter Your Code"
        placeholderTextColor={"#8AA2B2"}
        style={[
          styles.inputField,
          {
            letterSpacing: code == "" ? 0 : 0.5,
          },
        ]}
        value={code}
        onChangeText={(text) => setCode(text)}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitBtnText}>Get Started</Text>
        <Image source={next} style={styles.submitIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputBox: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: "#4785CF",
    alignItems: "center",
    borderRadius: 4,
    width: "100%",
  },
  inputField: {
    height: 40,
    width: "64.3%",
    paddingLeft: 8,
    paddingRight: 8,
    fontFamily: "SemiBold",
    fontSize: 14,
    color: "#003171",
  },
  submitButton: {
    height: 36,
    width: "35%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    backgroundColor: "#4785CF",
    flexDirection: "row",
  },
  submitBtnText: {
    color: "white",
    fontFamily: "SemiBold",
    fontSize: 12,
  },
  submitIcon: {
    width: 13,
    height: 13,
    marginRight: -8,
    marginLeft: 2,
  },
});

export default CustomTextInput;
