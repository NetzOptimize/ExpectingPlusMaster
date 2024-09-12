import React from "react";
import { View, Modal, StyleSheet, Image } from "react-native";

var LoadingGIF = require("../../assets/images/LoadingGIF.gif");

export default function LoadingModal({ visible = false }) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      statusBarTranslucent={true}
    >
      <View style={styles.centeredView}>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Image source={LoadingGIF} style={{ width: 200, height: 200 }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  loadingText: {
    fontFamily: "OpenSans-Bold",
    fontSize: 18,
    color: "#4785CF",
    marginTop: 14,
  },
});
