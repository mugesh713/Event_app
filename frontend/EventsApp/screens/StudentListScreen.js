import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, ActivityIndicator, Alert, ScrollView, Animated } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const StudentListScreen = ({ navigation }) => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchStudents();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://10.1.34.34:5000/get_students');
      setStudents(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const response = await axios.get(`http://10.1.34.34:5000/get_attendance?date=${formattedDate}`);
      setAttendance(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch attendance');
      setAttendance({});
    }
  };

  const handleMarkAttendance = async (studentId, status) => {
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      await axios.post('http://10.1.34.34:5000/mark_attendance', {
        student_id: studentId,
        status,
        date: formattedDate,
      });
      Alert.alert('Success', `Marked ${status} for student`);
      fetchAttendance();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark attendance');
    }
  };

  const showDatepicker = () => setShowDatePicker(true);

  return (
    <View style={styles.container}>
      <Button title="Select Date" onPress={showDatepicker} color="#4E9F3D" />
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="spinner"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}
      <Text style={styles.selectedDate}>
        Selected Date: {selectedDate.toISOString().split('T')[0]}
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#FF8C00" style={styles.loader} />
      ) : (
        <Animated.ScrollView contentContainerStyle={styles.scrollContainer} style={{ opacity: fadeAnim }}>
          {students.map((student) => (
            <View key={student.id} style={styles.card}>
              <View style={styles.actionCard}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentEmail}>{student.email}</Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.presentButton,
                      attendance[student.id] === 'Present' && styles.disabledButton,
                    ]}
                    onPress={() => handleMarkAttendance(student.id, 'Present')}
                    disabled={attendance[student.id] === 'Present'}
                  >
                    <MaterialIcons name="check-circle" size={20} color="white" />
                    <Text style={styles.buttonText}>Present</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.absentButton,
                      attendance[student.id] === 'Absent' && styles.disabledButton,
                    ]}
                    onPress={() => handleMarkAttendance(student.id, 'Absent')}
                    disabled={attendance[student.id] === 'Absent'}
                  >
                    <MaterialIcons name="remove-circle" size={20} color="white" />
                    <Text style={styles.buttonText}>Absent</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </Animated.ScrollView>
      )}
      <View style={styles.buttonsContainer}>
        <Button
          title="View Attendance"
          onPress={() => navigation.navigate('Attendance')}
          color="#00796b"
        />
        <Button
          title="Add Student"
          onPress={() => navigation.navigate('AddStudent')}
          color="#6a1b9a"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  selectedDate: {
    textAlign: 'center',
    marginVertical: 15,
    fontSize: 18,
    color: '#FF8C00',
  },
  loader: {
    alignSelf: 'center',
    marginTop: 30,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  actionCard: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  studentEmail: {
    fontSize: 16,
    color: '#6a1b9a',
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'space-around',
  },
  presentButton: {
    backgroundColor: '#32CD32',
    padding: 7,
    marginHorizontal: 5,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  absentButton: {
    backgroundColor: '#FF6347',
    padding: 7,
    marginHorizontal: 5,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#D3D3D3',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  buttonsContainer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 20,
  },
});

export default StudentListScreen;
