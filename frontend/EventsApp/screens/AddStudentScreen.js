import React, { useState } from 'react';
import { Text, View, TextInput, Alert, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const { width } = Dimensions.get('window');

const AddStudentScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddStudent = async () => {
    if (!name || !email || !enrollmentNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setAdding(true);
    try {
      await axios.post('http://10.1.34.34:5000/add_student', {
        name,
        email,
        enrollment_number: enrollmentNumber,
      });
      setAdding(false);
      Alert.alert('Success', 'Student added successfully');
      navigation.goBack(); // Navigate back to the Student List Screen
    } catch (error) {
      setAdding(false);
      Alert.alert('Error', 'Failed to add student');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <Text style={styles.title}>Add New Student</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Enrollment Number"
            value={enrollmentNumber}
            onChangeText={setEnrollmentNumber}
          />

          <TouchableOpacity style={styles.button} onPress={handleAddStudent} disabled={adding}>
            {adding ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>Add Student</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    marginTop: 50,
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

export default AddStudentScreen;
