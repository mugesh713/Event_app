import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { BACKEND_URL } from '@env';


const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); 

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    fetch(`http://10.1.34.34:5000/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setLoading(false);
        if (data.role === 'superadmin') {
          navigation.replace('SuperAdmin');
        } else if (data.role === 'admin') {
          navigation.replace('Admin');
        } else if (data.role === 'user') {
          navigation.replace('User');
        } else {
          Alert.alert('Error', data.message || 'Invalid credentials');
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        Alert.alert('Error', 'Something went wrong: ' + error.message);
      });
  };

  return (
    <LinearGradient colors={['#A0D8E0', '#B2E0F5']} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to your account</Text>

        <View style={styles.inputContainer}>
          <Icon name="mail-outline" size={20} color="#fff" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#0006"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock-closed-outline" size={20} color="#fff" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#0006"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible} // Toggle secure text entry
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Icon name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={20} color="black" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={styles.activityIndicator} />
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
          Don't have an account? <Text style={styles.signupText}>Sign up</Text>
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    color: '#000', // Dark color for better contrast against the gradient
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#000', // Dark color for better contrast against the gradient
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    color: 'black',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  icon: {
    color: 'black',
  },
  loginButton: {
    backgroundColor: '#FFF',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 20,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FD3A69', // Use a prominent color for button text
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#000', // Dark color for better contrast against the gradient
    textAlign: 'center',
  },
  signupText: {
    color: '#FD3A69', // Use a prominent color for signup text
    fontWeight: 'bold',
  },
  activityIndicator: {
    marginVertical: 20,
  },
});

export default LoginScreen;
