import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { WebView } from "react-native-webview";

interface GraphScreenProps {
  watchlist: string[];
}

export default function GraphScreen({ watchlist }: GraphScreenProps) {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const script = `
    let currentIndex = 0;
    const watchlist = ${JSON.stringify(watchlist)};
    const container1 = document.getElementById("tradingview_widget_1");
    const container2 = document.getElementById("tradingview_widget_2");

    function loadWidget(container, symbol) {
      container.innerHTML = '';
      new TradingView.widget({
        "autosize": true,
        "symbol": symbol,
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "backgroundColor": "rgba(15, 15, 15, 1)",
        "hide_top_toolbar": true,
        "hide_side_toolbar": true,
        "allow_symbol_change": false,
        "save_image": false,
        "calendar": false,
        "studies": ["MACD@tv-basicstudies", "RSI@tv-basicstudies"],
        "container_id": container.id,
        "support_host": "https://www.tradingview.com"
      });
    }

    function showNextSymbol() {
      const currentContainer = currentIndex % 2 === 0 ? container1 : container2;
      const nextContainer = currentIndex % 2 === 0 ? container2 : container1;
      const nextSymbol = watchlist[(currentIndex + 1) % watchlist.length];

      loadWidget(nextContainer, nextSymbol);
      
      setTimeout(() => {
        currentContainer.style.opacity = '0';
        nextContainer.style.opacity = '1';
        currentIndex = (currentIndex + 1) % watchlist.length;
        setTimeout(showNextSymbol, 1000);
      }, 9000);
    }

    loadWidget(container1, watchlist[currentIndex]);
    showNextSymbol();
  `;

  const htmlContent = `
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
        #tradingview_widget_1, #tradingview_widget_2 {
          height: 100%;
          width: 100%;
          position: absolute;
          top: 0;
          left: 0;
          transition: opacity 1s ease-in-out;
        }
        #tradingview_widget_1 {
          opacity: 1;
        }
        #tradingview_widget_2 {
          opacity: 0;
        }
      </style>
      <script src="https://s3.tradingview.com/tv.js"></script>
    </head>
    <body>
      <div id="tradingview_widget_1"></div>
      <div id="tradingview_widget_2"></div>
      <script>
        ${script}
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={{
          width: screenWidth,
          height: screenHeight,
        }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
