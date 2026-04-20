# Online Timetable Management System

A web-based **Online Timetable Management System** built to simplify the process of creating, managing, and viewing academic timetables in a college environment.

This project provides a centralized platform for timetable administration and personalized timetable access for students. It reduces manual effort, improves schedule organization, and offers a clean, role-based user experience.

---

## Features

### Admin Portal
- Secure admin login
- Dashboard with overview statistics
- Master Data Management for:
  - Faculty
  - Subjects
  - Rooms
  - Sections
- Section-wise timetable creation
- Faculty timetable derived automatically from assigned section timetable entries
- Grid-based timetable viewing
- Fixed sidebar with profile section
- Dynamic dashboard cards for module switching

### Student Portal
- Secure student login
- Personalized timetable access
- Student profile shown in sidebar
- Weekly timetable displayed in grid format
- Clean and professional dashboard interface

### Core System Features
- Centralized timetable data storage
- MySQL database integration
- Slot-based timetable structure
- Timetable organized by:
  - Day
  - Time Slot
  - Section
  - Subject
  - Faculty
  - Room

---

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MySQL

### Tools Used
- Visual Studio Code
- MySQL Workbench
- Git & GitHub

---

## Project Structure

```bash
Frontend/
  admin_portal/
    admindashboard.html
    admin.css
    admin.js

  faculty_portal/
    (planned / under development)

  login_portal/
    assets/
      bg.png
    login.html
    login.css
    login.js

  student_portal/
    student.html
    student.css
    student.js

Backend/
  .env
  db.js
  package.json
  server.js
