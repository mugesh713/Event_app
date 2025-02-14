import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import axios from 'axios';

const AttendanceScreen = ({ navigation, route }) => {
  const [studentId, setStudentId] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleSubmit = () => {
    if (!studentId) {
      Alert.alert('Error', 'Please enter a student ID');
      return;
    }
    fetchAttendance(studentId);
  };

  const fetchAttendance = async (studentId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://10.1.34.34:5000/get_student_attendance?student_id=${studentId}`
      );
      if (response.data.length > 0) {
        const sortedAttendance = sortAttendanceByDate(response.data);
        setAttendance(sortedAttendance);
        setShowDetails(true);
      } else {
        Alert.alert('No records', 'No attendance records found for this student.');
        setShowDetails(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch attendance');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sortAttendanceByDate = (data) => {
    return data.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sorts by date in ascending order
  };

  const AttendanceDetails = () => (
    <View style={styles.detailsContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#ff6347" style={styles.loader} />
      ) : (
        attendance.length > 0 ? (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {attendance.map((record, index) => (
              <View key={index} style={styles.record}>
                <Text style={styles.recordDate}>{new Date(record.date).toLocaleDateString()}</Text>
                <Text style={[styles.recordStatus, record.status === 'Present' ? styles.present : styles.absent]}>
                  {record.status}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noRecord}>No attendance records found</Text>
        )
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Attendance</Text>
      {!showDetails ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter Student ID"
            value={studentId}
            onChangeText={setStudentId}
            keyboardType="numeric"
          />
          <Button title="View Attendance" onPress={handleSubmit} color="#ff6347" />
        </>
      ) : (
        <AttendanceDetails />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsContainer: {
    marginTop: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  record: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  recordDate: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  recordStatus: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  present: {
    color: '#28a745',
  },
  absent: {
    color: '#dc3545',
  },
  noRecord: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  loader: {
    marginTop: 50,
    alignSelf: 'center',
  },
});

export default AttendanceScreen;
