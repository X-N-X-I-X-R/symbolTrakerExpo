import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

interface ManageSymbolsScreenProps {
  watchlist: string[];
  setWatchlist: (symbols: string[]) => void;
}

export default function ManageSymbolsScreen({
  watchlist,
  setWatchlist,
}: ManageSymbolsScreenProps) {
  const [newSymbol, setNewSymbol] = useState<string>("");

  const addSymbol = () => {
    if (newSymbol && !watchlist.includes(newSymbol)) {
      setWatchlist([...watchlist, newSymbol]);
      setNewSymbol("");
    }
  };

  const removeSymbol = (symbol: string) => {
    setWatchlist(watchlist.filter((item) => item !== symbol));
  };

  return (
    <View style={styles.manageContainer}>
      <Text style={styles.title}>Manage Watchlist</Text>
      <TextInput
        style={styles.input}
        value={newSymbol}
        onChangeText={setNewSymbol}
        placeholder="Enter symbol (e.g., NASDAQ:AAPL)"
        placeholderTextColor="#888"
      />
      <Button title="Add Symbol" onPress={addSymbol} />
      {watchlist.map((symbol, index) => (
        <View key={index} style={styles.symbolItem}>
          <Text style={styles.symbolText}>{symbol}</Text>
          <Button title="Remove" onPress={() => removeSymbol(symbol)} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  manageContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    color: "#fff",
  },
  symbolItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  symbolText: {
    color: "#fff",
  },
});
