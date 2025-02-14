import React, { useState, useEffect, useCallback } from "react";
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Animated,
    Modal,
    Pressable,
    Image,
    Linking
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons';
import { ref, deleteObject } from "firebase/storage";
import { storage } from '../firebase';
import { BACKEND_URL } from '@env';

const AdminEventScreen = () => {
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

    const delete_press = (id, eventPosterUrl) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this event?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => delete_event(id, eventPosterUrl) }, // Pass the poster URL here
            ],
            { cancelable: true }
        );
    };
    

    const delete_event = (id, eventPosterUrl) => {
        fetch(`http://10.1.34.34:5000/events/${id}`, { method: 'DELETE' })
            .then((res) => {
                if (res.ok) {
                    if (eventPosterUrl) {
                        const posterRef = ref(storage, eventPosterUrl);
                        deleteObject(posterRef)
                            .then(() => {
                                console.log('Poster deleted from Firebase');
                            })
                            .catch((error) => {
                                console.error('Error deleting poster from Firebase:', error);
                            });
                        }
                    Alert.alert('Event Deleted Successfully');
                    fetchevents();
                } else {
                    Alert.alert('Error', 'Failed to delete the event');
                }
            })
            .catch((error) => {
                console.error('Error deleting event:', error);
            });
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
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AdminAddEvent')}>
                    <Text style={styles.ButtonText}>+ Add a New Event</Text>
                </TouchableOpacity>
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
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => navigation.navigate('AdminEditEvent', { id: item.id })}
                                    >
                                        <MaterialIcons name="edit" size={20} color="white" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => delete_press(item.id,item.Event_Poster)}
                                    >
                                        <MaterialIcons name="delete" size={20} color="white" />
                                    </TouchableOpacity>
                                </View>
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

export default AdminEventScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#e0f7fa',
    },
    scrollContainer: {
        paddingBottom: 20,
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
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    location: {
        fontSize: 14,
        color: '#666',
    },
    locationText: {
        color: '#005B9F',
        textDecorationLine: 'underline',
    },
    addButton: {
      backgroundColor: '#6a1b9a',
      paddingVertical: 15,
      paddingHorizontal: 25,
      borderRadius: 30,
      alignSelf: 'center',
      marginTop: 20,
    },
    signoutButton: {
      backgroundColor: '#B51645',
      paddingVertical: 15,
      flexDirection: 'row',
      paddingHorizontal: 25,
      borderRadius: 30,
      alignSelf: 'center',
      marginTop: 20,
    },
    ButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    fullscreenImage: {
        width: '100%',
        height: '80%',
    },
    actionContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
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
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        margin: 10,
        justifyContent: 'space-between',
        marginVertical: 10,
        flexDirection: 'column',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    actioncard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    title: {
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
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    iconButton: {
        backgroundColor: '#6a1b9a',
        padding: 5,
        margin: 10,
        borderRadius: 6,
    },
    addButton: {
        backgroundColor: '#6a1b9a',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 30,
        alignSelf: 'center',
        marginTop: 20,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomPadding: {
        height: 100,
    },
    eventPoster: {
      width: "100%",
      height: 200,
      borderRadius: 5,
      marginBottom: 10,
    },
});
