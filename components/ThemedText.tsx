import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Text, Alert, Dimensions, ScrollView, TouchableOpacity } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { WebView } from "react-native-webview";

export default function Index() {
  const [symbolsList, setSymbolsList] = useState<string[]>([]);
  const [remainingSymbols, setRemainingSymbols] = useState<string[]>([]);
  const [displaySymbols, setDisplaySymbols] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showButton, setShowButton] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const handleFileUpload = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "text/plain",
      });

      if (res.assets && res.assets.length > 0 && res.assets[0].uri) {
        const fileUri = res.assets[0].uri;
        const response = await fetch(fileUri);
        const fileContent = await response.text();

        const symbols = fileContent
          .split(",")
          .map((line) => line.trim())
          .filter((line) => line.length > 0 && !line.startsWith("###"));

        if (symbols.length >= 6) {
          setSymbolsList(symbols);
          setRemainingSymbols(symbols.slice(6));
          setDisplaySymbols(symbols.slice(0, 6));
          setShowButton(false); // הסתרת הכפתור לאחר הטעינה
          Alert.alert("הקובץ נטען בהצלחה", "הסימבולים נטענו בהצלחה.");
          console.log("Symbols loaded:", symbols);
        } else {
          Alert.alert("שגיאה", "הקובץ שהועלה לא מכיל מספיק סימבולים.");
        }
      } else {
        Alert.alert("שגיאה", "לא נבחר קובץ או שהייתה בעיה בהעלאתו.");
      }
    } catch (err) {
      Alert.alert("שגיאה", "לא ניתן לקרוא את הקובץ שהועלה.");
      console.error("File upload error:", err);
    }
  };

  const generateHtmlContent = (symbol: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          background-color: #000;
        }
        #tradingview_widget {
          height: 100%;
          width: 100%;
        }
      </style>
      <script src="https://s3.tradingview.com/tv.js"></script>
    </head>
    <body>
      <div id="tradingview_widget"></div>
      <script>
        new TradingView.widget({
          "autosize": true,
          "symbol": "${symbol}",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "container_id": "tradingview_widget",
          "backgroundColor": "rgba(15, 15, 15, 1)",
          "hide_top_toolbar": true,
          "hide_side_toolbar": true,
          "allow_symbol_change": false,
          "save_image": false,
          "calendar": false,
          "studies": [],
        });
      </script>
    </body>
    </html>
  `;

  useEffect(() => {
    if (symbolsList.length >= 6) {
      const intervalId = setInterval(() => {
        const nextIndex = (currentIndex + 1) % 6;
        scrollViewRef.current?.scrollTo({
          x: screenWidth * nextIndex,
          animated: true,
        });
        console.log(
          `Swapping to next symbol at index: ${nextIndex}, symbol: ${displaySymbols[nextIndex]}`
        );

        const newDisplaySymbols = [...displaySymbols];
        if (remainingSymbols.length > 0) {
          const nextSymbol = remainingSymbols[0];
          newDisplaySymbols[currentIndex] = nextSymbol;
          setRemainingSymbols((prev) => prev.slice(1));
          console.log(`Updating symbol at index ${currentIndex} to: ${nextSymbol}`);
        } else {
          setRemainingSymbols(symbolsList);
          console.log("Refilling remainingSymbols with symbolsList.");
        }

        setDisplaySymbols(newDisplaySymbols);
        setCurrentIndex(nextIndex);
      }, 12000); // 12 seconds = 12000 milliseconds

      return () => clearInterval(intervalId);
    }
  }, [symbolsList, displaySymbols, remainingSymbols, currentIndex]);

  return (
    <View style={styles.container}>
      {showButton && (
        <TouchableOpacity style={styles.buttonContainer} onPress={handleFileUpload}>
          <Text style={styles.buttonText}>העלה</Text>
        </TouchableOpacity>
      )}
      {displaySymbols.length === 6 && (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ width: screenWidth, height: screenHeight }}
        >
          {displaySymbols.map((symbol, index) => (
            <WebView
              key={index}
              originWhitelist={["*"]}
              source={{ html: generateHtmlContent(symbol) }}
              style={{ width: screenWidth, height: screenHeight }}
              javaScriptEnabled
              domStorageEnabled
              scrollEnabled={false}
              onLoadEnd={() => console.log(`WebView for symbol ${symbol} loaded.`)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  buttonContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
    width: 50, // רוחב מצומצם יותר
    height: 50, // גובה מצומצם יותר
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)", // רקע לבן עם שקיפות כדי שיהיה ניתן לראות אותו בקלות
    borderRadius: 25, // עיגול הפינות
    alignSelf: "flex-end", // מיקום בתוך ההורה שלו (מבטיח שלא ימתח לרוחב מלא)
  },
  buttonText: {
    fontSize: 12,
    color: "#000",
  },
});
