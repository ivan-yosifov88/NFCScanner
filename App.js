import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, ScrollView, Platform } from 'react-native';
import NfcManager, { NfcEvents } from 'react-native-nfc-manager';

export default function App() {
  const [hasNFC, setHasNFC] = useState(false);
  const [nfcMessage, setNfcMessage] = useState('');

  useEffect(() => {
    const checkNFC = async () => {
      try {
        const supported = await NfcManager.isSupported();
        setHasNFC(supported);
        if (supported) {
          await NfcManager.start();
        }
      } catch (ex) {
        console.log('Checking NFC failed', ex);
        setNfcMessage('Error checking NFC: ' + ex.message);
      }
    };
    checkNFC();
    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      NfcManager.unregisterTagEvent().catch(() => {/* ignore */});
    };
  }, []);

  const readNFC = async () => {
    setNfcMessage('Scanning for NFC tags...');
    try {
      await NfcManager.registerTagEvent();
      NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) => {
        console.log('Tag found', tag);
        setNfcMessage(JSON.stringify(tag, null, 2));
        NfcManager.unregisterTagEvent().catch(() => {/* ignore */});
      });
    } catch (ex) {
      console.warn('Error registering NFC listener', ex);
      setNfcMessage('Error starting NFC scan: ' + ex.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NFC Scanner</Text>
      <Text style={styles.subtitle}>NFC Supported: {hasNFC ? 'Yes' : 'No'}</Text>
      {hasNFC && (
        <Button title="Scan NFC Tag" onPress={readNFC} />
      )}
      <ScrollView style={styles.messageContainer}>
        <Text style={styles.message}>{nfcMessage}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  messageContainer: {
    marginTop: 20,
    maxHeight: 200,
    width: '100%',
  },
  message: {
    fontSize: 14,
  },
});