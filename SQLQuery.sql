-- Create the database
CREATE DATABASE eventsapp;

-- Use the database
USE eventsapp;

-- Create the events table
CREATE TABLE events (
    id VARCHAR(36) PRIMARY KEY,
    Event_Name VARCHAR(255) NOT NULL,
    Event_Date DATE NOT NULL,
    Event_Link VARCHAR(255),
    Event_Description TEXT,
    Event_Poster TEXT,
    Event_Location VARCHAR(255)
);

-- Create the users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user' , 'superadmin') DEFAULT 'user'
);


CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    enrollment_number VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('Present', 'Absent') NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(enrollment_number)
);