from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import uuid
import bcrypt 
from datetime import date

app = Flask(__name__)
CORS(app)

db_config = {
    'host' : 'localhost',
    'user' : 'root',
    'password' : '1234',
    'database' : 'eventsapp'
}

def create_connection():
    connection = mysql.connector.connect(
        host = db_config['host'],
        user = db_config['user'],
        password = db_config['password'],
        database = db_config['database']
    )
    return connection

@app.route('/events', methods = ['GET'])
def get_evnets():
    connection = create_connection()
    cursor = connection.cursor(dictionary = True)

    cursor.execute("SELECT * FROM events")
    events = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(events)

@app.route('/events', methods = ['POST'])
def store_events():
    data = request.json
    Event_Name = data['event_name']
    Event_Date = data['event_date']
    Event_Poster = data['image']
    Event_Description= data['event_desc']
    Event_Link= data['event_link']
    Event_Location= data['event_loc']

    id = str(uuid.uuid4())

    connection = create_connection()
    cursor = connection.cursor(dictionary = True)

    query = "INSERT INTO events (Event_Name,Event_Date,Event_Link,Event_Description,id,Event_Poster,Event_Location) VALUES (%s, %s, %s, %s, %s, %s, %s)"
    values = (Event_Name,Event_Date,Event_Link,Event_Description,id,Event_Poster,Event_Location)
    cursor.execute(query, values)

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({"result" : "Event added successfully"})

@app.route('/events/<string:id>', methods = ['PUT'])
def update_events(id):
    data = request.json
    Event_Name = data['event_name']
    Event_Date = data['event_date']
    Event_Description= data['event_desc']
    Event_Link= data['event_link']
    Event_Location= data['event_loc']
    Event_Poster= data['image']

    connection = create_connection()
    cursor = connection.cursor(dictionary = True)

    query = "UPDATE events SET Event_Name = %s, Event_Date = %s, Event_Link = %s, Event_Description = %s, Event_Poster = %s, Event_Location = %s WHERE id = %s"
    values = (Event_Name,Event_Date,Event_Link,Event_Description,Event_Poster,Event_Location,id)
    cursor.execute(query, values)

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({"result" : "Event updated successfully"})

@app.route('/events/<string:id>', methods = ['GET'])
def fetch_one_event(id):
    connection = create_connection()
    cursor = connection.cursor(dictionary = True)

    query = 'SELECT * FROM events WHERE id = %s'
    cursor.execute(query,(id,))
    event = cursor.fetchone()

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify(event)

@app.route('/events/<string:id>', methods = ['DELETE'])
def delete_events(id):
    connection = create_connection()
    cursor = connection.cursor()

    query = 'DELETE FROM events WHERE id = %s'
    cursor.execute(query,(id,))

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({"result" : "Event deleted successfully"})

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user')  # Default to 'user' if role is not provided

    # Validate input
    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    # Check if email already exists
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    existing_user = cursor.fetchone()

    if existing_user:
        return jsonify({"error": "User with this email already exists"}), 409

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Insert the new user into the database
    id = str(uuid.uuid4())
    query = "INSERT INTO users (id, username, email, password, role) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(query, (id, username, email, hashed_password, role))
    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({"message": "User registered successfully"}), 201

# Login Route
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    # Validate input
    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    connection = create_connection()
    cursor = connection.cursor(dictionary=True)

    # Find the user by email
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if the password is correct
    if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({"error": "Invalid password"}), 401

    # Return success and role information
    return jsonify({
        "message": "Login successful",
        "role": user['role']
    }), 200

# Example of how to route based on role in frontend
@app.route('/role-check', methods=['POST'])
def role_check():
    data = request.json
    email = data.get('email')

    # Validate input
    if not email:
        return jsonify({"error": "Missing email"}), 400

    connection = create_connection()
    cursor = connection.cursor(dictionary=True)

    # Find the user by email
    cursor.execute("SELECT role FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    cursor.close()
    connection.close()

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "role": user['role']
    }), 200


# Fetch all users
@app.route('/users', methods=['GET'])
def get_users():
    try:
        connection = create_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id, username, role FROM users")
        users = cursor.fetchall()
        cursor.close()
        connection.close()
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Delete a user by ID
@app.route('/users/<string:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        connection = create_connection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Change user role
@app.route('/users/<string:user_id>/role', methods=['PUT'])
def update_user_role(user_id):
    try:
        data = request.json
        new_role = data.get('role')

        if new_role not in ['admin', 'user']:
            return jsonify({"error": "Invalid role"}), 400

        connection = create_connection()
        cursor = connection.cursor()
        cursor.execute("UPDATE users SET role = %s WHERE id = %s", (new_role, user_id))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"message": "Role updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Route to add a new student
@app.route('/add_student', methods=['POST'])
def add_student():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    enrollment_number = data.get('enrollment_number')

    connection = create_connection()
    cursor = connection.cursor()

    try:
        query = "INSERT INTO students (name, email, enrollment_number) VALUES (%s, %s, %s)"
        cursor.execute(query, (name, email, enrollment_number))
        connection.commit()
        return jsonify({"message": "Student added successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        connection.close()


@app.route('/get_students', methods=['GET'])
def get_students():
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT id, name, email FROM students")
    students = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(students)

@app.route('/get_attendance', methods=['GET'])
def get_attendance():
    date = request.args.get('date')
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    query = "SELECT student_id, status FROM attendance WHERE date = %s"
    cursor.execute(query, (date,))
    attendance = cursor.fetchall()
    cursor.close()
    connection.close()
    
    attendance_dict = {record['student_id']: record['status'] for record in attendance}
    return jsonify(attendance_dict)

@app.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    data = request.json
    student_id = data['student_id']
    status = data['status']
    date = data['date']
    
    connection = create_connection()
    cursor = connection.cursor()
    query = "INSERT INTO attendance (student_id, status, date) VALUES (%s, %s, %s)"
    cursor.execute(query, (student_id, status, date))
    connection.commit()
    cursor.close()
    connection.close()
    
    return jsonify({"result": "Attendance marked successfully"})

@app.route('/get_student_attendance', methods=['GET'])
def get_student_attendance():
    student_id = request.args.get('student_id')  # Get student ID
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    query = "SELECT student_id, date, status FROM attendance WHERE student_id = %s"  # Query for all attendance records for the student
    cursor.execute(query, (student_id,))
    attendance = cursor.fetchall()
    cursor.close()
    connection.close()
    
    return jsonify(attendance)


if __name__ == '__main__':
    app.run(host = '0.0.0.0' , port=5000)