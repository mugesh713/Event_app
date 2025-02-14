import React, { useState, useEffect, useCallback } from "react";
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Animated,
    Image,
    Modal,
    Pressable,
    Linking
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import {useNavigation, useFocusEffect } from "@react-navigation/native";
import { BACKEND_URL } from '@env';

const UserEventScreen = () => {
    const [events, setEvents] = useState([]);
    const [fadeAnim] = useState(new Animated.Value(0));
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const fetchevents = () => {
        fetch(`http://10.1.34.34:5000/events`)
            .then((res) => res.json())
            .then((data) => setEvents(data))
            .catch((err) => console.log(err));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
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

    const openImageModal = (imageUri) => {
        setSelectedImage(imageUri);
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.actionContainer}>
                <TouchableOpacity style={styles.signoutButton} onPress={() => navigation.navigate('Login')}>
                    <MaterialIcons name="logout" size={20} color="white" />
                    <Text style={styles.ButtonText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {events.map((item) => (
                        <View key={item.id} style={styles.card}>
                            <View style={styles.actioncard}>
                                <Text style={styles.title}>{item.Event_Name}</Text>
                            </View>
                            <TouchableOpacity onPress={() => openImageModal(item.Event_Poster)}>
                                <Image
                                    source={{ uri: item.Event_Poster }}
                                    style={styles.eventPoster}
                                />
                            </TouchableOpacity>
                            <Text style={styles.date}>Date :  (YYYY-MM-DD)</Text>
                            <Text style={styles.bold}>{formatDate(item.Event_Date)}</Text>
                            <Text style={styles.description}>About : </Text>
                            <Text style={styles.bold}>       {item.Event_Description}</Text>
                            <Text style={styles.location}>Location : </Text>
                            <TouchableOpacity 
                                style={styles.locationbutton} 
                                onPress={() => Linking.openURL(item.Event_Location)}
                            >
                                <Text style={styles.locationText}>Open in Google Maps</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.button} 
                                onPress={() => Linking.openURL(item.Event_Link)}
                            >
                                <Text style={styles.buttonText}>Register for Event</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    <View style={styles.bottomPadding} />
                </ScrollView>
            </Animated.View>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </Pressable>
                    <Image
                        source={{ uri: selectedImage }}
                        style={styles.fullscreenImage}
                        resizeMode="contain"
                    />
                </View>
            </Modal>
        </View>
    );
};

export default UserEventScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#e0f7fa',
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    actionContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    signoutButton: {
        backgroundColor: '#B51645',
        paddingVertical: 12,
        flexDirection: 'row',
        paddingHorizontal: 20,
        borderRadius: 30,
        alignSelf: 'center',
        marginTop: 15,
        marginLeft: '65%',
    },
    ButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    button: {
        width: '50%',
        padding: 8,
        backgroundColor: '#D91656',
        borderRadius: 10,
        alignItems: 'center',
        margin: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        margin: 10,
        marginVertical: 10,
        flexDirection: 'column',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    actioncard: {
        alignItems: 'center',
        textAlign: 'center',
        flexDirection: 'row',
    },
    title: {
        alignItems: 'center',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 5,
        marginBottom: 5,
    },
    date: {
        fontSize: 14,
        color: '#888',
        marginVertical: 4,
    },
    description: {
        fontSize: 14,
        color: '#666',
    },
    location: {
        fontSize: 14,
        color: '#666',
    },
    locationText: {
        color: '#005B9F',
        textDecorationLine: 'underline',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    eventPoster: {
        width: "100%",
        height: 200,
        borderRadius: 5,
        marginBottom: 10,
    },
    bottomPadding: {
        height: 100,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenImage: {
        width: '100%',
        height: '80%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 5,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
});
