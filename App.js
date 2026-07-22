import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const PYTHON_IP = "172.20.10.3";

export default function App() {
    const [slots, setSlots] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOtoparkData = async (showLoader = false) => {
        try {
            if (showLoader) setLoading(true);
            const response = await fetch(`http://${PYTHON_IP}:5000/otopark/slots`);
            const json = await response.json();

            setSlots(json.slots);
            setError(null);
        } catch (err) {
            setError("Connection failed. Check server and IP.");
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    useEffect(() => {
        fetchOtoparkData(true);

        const intervalId = setInterval(() => {
            fetchOtoparkData(false);
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Text style={styles.mainTitle}>Live Parking Slots</Text>

                    {loading && !slots ? (
                        <ActivityIndicator size="large" color="#007bff" />
                    ) : error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : slots ? (
                        Object.keys(slots).map((slotId) => {
                            const slot = slots[slotId];
                            const isOccupied = slot.status.includes("Occupied");

                            let statusStyle = styles.statusEmpty;
                            if (isOccupied) statusStyle = styles.statusOccupied;

                            return (
                                <View key={slotId} style={styles.card}>
                                    <Text style={styles.slotTitle}>
                                        Slot {slotId} - <Text style={statusStyle}>{slot.status}</Text>
                                    </Text>

                                    <View style={styles.infoRow}>
                                        <Text style={styles.label}>Entry Time:</Text>
                                        <Text style={styles.value}>{slot.entry_time}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.label}>Exit Time:</Text>
                                        <Text style={styles.value}>{slot.exit_time}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.label}>Duration:</Text>
                                        <Text style={styles.value}>{slot.duration} Sec</Text>
                                    </View>
                                    <View style={styles.feeContainer}>
                                        <Text style={styles.feeLabel}>Fee: {slot.fee} TL</Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={styles.errorText}>No data.</Text>
                    )}

                    <TouchableOpacity style={styles.refreshButton} onPress={() => fetchOtoparkData(true)}>
                        <Text style={styles.buttonText}>Refresh Connection</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f9' },
    scrollContainer: { padding: 20, alignItems: 'center' },
    mainTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20 },
    card: { width: '100%', backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 15, elevation: 3 },
    slotTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 5 },
    statusOccupied: { color: '#d32f2f', fontWeight: 'bold' },
    statusEmpty: { color: '#388e3c', fontWeight: 'bold' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    label: { fontSize: 14, color: '#666' },
    value: { fontSize: 14, color: '#333', fontWeight: 'bold' },
    feeContainer: { marginTop: 10, backgroundColor: '#e8f5e9', padding: 8, borderRadius: 6, alignItems: 'center' },
    feeLabel: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32' },
    refreshButton: { backgroundColor: '#007bff', padding: 16, borderRadius: 8, alignItems: 'center', width: '100%', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    errorText: { color: 'red', textAlign: 'center', marginVertical: 20 }
});
