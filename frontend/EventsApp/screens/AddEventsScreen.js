import React, { useState } from "react";
import { Text, View, TextInput, Alert, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import { storage } from "../firebase";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { BACKEND_URL } from '@env';

const { width, height } = Dimensions.get('window');

const AddEventScreen = () => {
    const navigation = useNavigation();
    const [eventname, setEventName] = useState('');
    const [eventdate, setEventDate] = useState('');
    const [eventdesc, setEventDesc] = useState('');
    const [eventlink, setEventLink] = useState('');
    const [eventloc, setEventLoc] = useState('');
    const [image, setImage] = useState(null);
    const [imageurl, setImageurl] = useState(null);
    const [adding, setAdding] = useState(false);        

    const uploadImage = async (uri) => {
        try {
            const response = await fetch(uri);

            const blob = await response.blob();

            const fileName = `${uuidv4()}.jpg`;
            const storageRef = ref(storage, fileName);

            await uploadBytes(storageRef, blob);

            const downloadUrl = await getDownloadURL(storageRef);
            setImageurl(downloadUrl);
            
            return downloadUrl;
        } catch (error) {
            Alert.alert("Upload Error", `Failed to upload image: ${error.message}`);
            console.error("Upload Error:", error);
        }
    };

    const pickimage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissions Required', 'To access your files, permission is needed.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({ 
            mediaTypes: ImagePicker.MediaTypeOptions.Images, 
            allowsEditing: true, 
            quality: 1 
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const takeimage = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'To access your camera, permission is needed.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({ 
            allowsEditing: true, 
            quality: 1 
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const AddEvent = async () => {
        if (!image) {
            Alert.alert("Error", "Please select and upload an image first");
            return;
        }
        setAdding(true);
        try {
            const imageUrl = await uploadImage(image);
            if (imageUrl) {
                const response = await fetch(`http://10.1.34.34:5000/events`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        event_name: eventname, 
                        event_date: eventdate, 
                        event_desc: eventdesc, 
                        event_link: eventlink,
                        event_loc: eventloc,
                        image: imageUrl 
                    }),
                });
                setAdding(false);
                if (response.ok) {
                    Alert.alert('Success', 'Event added successfully!');
                    setEventName('');
                    setEventDate('');
                    setEventDesc('');
                    setEventLink('');
                    setEventLoc('');
                    setImage(null);
                    setImageurl(null);
                    navigation.navigate("SuperAdmin");
                } else {
                    Alert.alert('Error', 'Failed to add event. Please try again.');
                }
            } else {
                setAdding(false);
                Alert.alert('Error', 'Failed to upload image.');
            }
        } catch (error) {
            setAdding(false);
            Alert.alert("Error", "Failed to add event. Please try again.");
            console.error("Error adding event:", error);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.container}>
                    <Text style={styles.title}>Add New Event</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Event Name"
                        value={eventname}
                        onChangeText={setEventName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Event Date (YYYY-MM-DD)"
                        value={eventdate}
                        onChangeText={setEventDate}
                    />
                    <TextInput
                        style={[styles.input, styles.textArea1]}
                        placeholder="Event Registration Link"
                        value={eventlink}
                        onChangeText={setEventLink}
                        multiline={true}
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Event Description"
                        value={eventdesc}
                        onChangeText={setEventDesc}
                        multiline={true}
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Event Location (Google Maps Link)"
                        value={eventloc}
                        onChangeText={setEventLoc}
                    />
                    <View style={styles.imagePickerContainer}>
                        <TouchableOpacity style={styles.imageButton} onPress={pickimage}>
                            <Text style={styles.imageButtonText}>Pick Poster from Gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.imageButton} onPress={takeimage}>
                            <Text style={styles.imageButtonText}>Take a Photo</Text>
                        </TouchableOpacity>
                    </View>

                    {image && (
                        <Image
                            source={{ uri: image }}
                            style={{ width: width * 0.8, height: height * 0.3, marginVertical: 20 }}
                            resizeMode="contain"
                        />
                    )}

                    <TouchableOpacity style={styles.button} onPress={AddEvent} disabled={adding}>
                        {adding ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Add Event</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default AddEventScreen;

const styles = StyleSheet.create({
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        padding: 15,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    textArea1: {
        height: 70,
    },
    textArea: {
        height: 100,
    },
    imagePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 15,
        width: '100%',
    },
    imageButton: {
        padding: 10,
        backgroundColor: '#D91656',
        borderRadius: 7,
    },
    imageButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight:"500",
    },
    button: {
        width: '100%',
        padding: 12,
        backgroundColor: '#6a1b9a',
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
