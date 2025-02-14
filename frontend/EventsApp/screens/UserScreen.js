import React, { useState, useEffect, useCallback } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Alert, Animated } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons';

const AdminScreen = () => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const navigation = useNavigation();

    const fetchevents = () => {
        fetch(`http://10.1.34.34:5000/events`)
            .then((res) => res.json())
            .then((data) => console.log(data)) // Just for demonstration, you can handle the events here
            .catch((err) => console.log(err));
    };

    useEffect(() => {
        fetchevents();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchevents();
        }, [])
    );

    return (
        <View style={styles.container}>
            <Animated.View style={{ opacity: fadeAnim }}>
                <View style={styles.boxContainer}>
                    <TouchableOpacity
                        style={[styles.box, { backgroundColor: '#3f51b5' }]}
                        onPress={() => navigation.navigate('UserEvent')}
                    >
                        <Text style={styles.boxText}>Events</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.box, { backgroundColor: '#FF9800' }]}
                        onPress={() => navigation.navigate('Attendance')}
                    >
                        <MaterialIcons name="school" size={20} color="white" />
                        <Text style={styles.boxText}>Attendance</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

export default AdminScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f3f3f3',
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    button: {
        flexDirection: 'row',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10, // Added space between icon and text
    },
    boxContainer: {
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    box: {
        width: '100%', // Make each box 48% of the container width to allow for 2 in a row
        paddingVertical: 30,
        paddingHorizontal: 20,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    boxText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10, // Adds space between icon and text
        textAlign: 'center',
    },
});

