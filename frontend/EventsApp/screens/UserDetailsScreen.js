import React, { useState, useEffect, useCallback } from "react";
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Animated
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons';
import { BACKEND_URL } from '@env';

const UserDetailsScreen = () => {
    const [users, setUsers] = useState([]);
    const [fadeAnim] = useState(new Animated.Value(0));
    const navigation = useNavigation();

    // Fetch users from the backend
    const fetchUsers = () => {
        fetch(`http://10.1.34.34:5000/users`)
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch((err) => console.log(err));
    };

    const removeUser = (id) => {
        Alert.alert(
            'Confirm Remove',
            'Are you sure you want to remove this user?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => confirmRemoveUser(id) },
            ],
            { cancelable: true }
        );
    };

    const confirmRemoveUser = (id) => {
        fetch(`http://10.1.34.34:5000/users/${id}`, { method: 'DELETE' })
            .then((res) => {
                if (res.ok) {
                    Alert.alert('User Removed Successfully');
                    fetchUsers(); // Refresh the user list
                } else {
                    Alert.alert('Error', 'Failed to remove the user');
                }
            })
            .catch((error) => {
                console.error('Error deleting user:', error);
            });
    };

    const changeUserRole = (id, newRole) => {
        fetch(`http://10.1.34.34:5000/users/${id}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role: newRole }),
        })
            .then((res) => {
                if (res.ok) {
                    Alert.alert('Role Updated Successfully');
                    fetchUsers(); // Refresh the user list
                } else {
                    Alert.alert('Error', 'Failed to update the role');
                }
            })
            .catch((error) => {
                console.error('Error updating role:', error);
            });
    };

    useEffect(() => {
        fetchUsers();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchUsers();
        }, [])
    );

    return (
        <View style={styles.container}>
            <Animated.View style={{ opacity: fadeAnim }}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {users.map((user) => (
                        user.role != 'superadmin' && (
                        <View key={user.id} style={styles.card}>
                            <View style={styles.actionCard}>
                                <Text style={styles.userName}>UserName : {user.username}</Text>
                                <Text style={styles.userRole}>Role : {user.role}</Text>
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={styles.roleButton}
                                        onPress={() => changeUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                                    >
                                        <MaterialIcons name="swap-horiz" size={20} color="white" />
                                        <Text style={styles.buttonText}>Change Role</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => removeUser(user.id)}
                                    >
                                        <MaterialIcons name="delete" size={20} color="white" />
                                        <Text style={styles.buttonText}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        )
                    ))}
                    <View style={styles.bottomPadding} />
                </ScrollView>
            </Animated.View>
        </View>
    );
};

export default UserDetailsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        paddingBottom: 20,
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
    actionCard: {
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    userRole: {
        fontSize: 16,
        color: '#6a1b9a',
        marginTop: 10,
    },
    buttonRow: {
        flexDirection: 'row',
    },
    roleButton: {
        backgroundColor: '#6a1b9a',
        padding: 5,
        margin: 10,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    removeButton: {
        backgroundColor: '#F95454',
        padding: 5,
        margin: 10,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: "500",
        marginLeft: 5,
    },
    bottomPadding: {
        height: 100,
    },
});
