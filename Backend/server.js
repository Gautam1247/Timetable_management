import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Timetable Management Backend Running");
});

/* ---------------- DASHBOARD STATS ---------------- */
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const [[faculty]] = await pool.query(
      "SELECT COUNT(*) AS count FROM faculty",
    );
    const [[subjects]] = await pool.query(
      "SELECT COUNT(*) AS count FROM subjects",
    );
    const [[rooms]] = await pool.query("SELECT COUNT(*) AS count FROM rooms");
    const [[sections]] = await pool.query(
      "SELECT COUNT(*) AS count FROM sections",
    );
    const [[slots]] = await pool.query(
      "SELECT COUNT(*) AS count FROM time_slots WHERE slot_label <> 'Lunch Break'",
    );
    const [[timetable]] = await pool.query(
      "SELECT COUNT(*) AS count FROM timetable",
    );

    res.json({
      faculty: faculty.count,
      subjects: subjects.count,
      rooms: rooms.count,
      sections: sections.count,
      slots: slots.count,
      timetable: timetable.count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ---------------- FACULTY ---------------- */
app.get("/api/faculty", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM faculty ORDER BY faculty_id DESC",
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/faculty", async (req, res) => {
  try {
    const { faculty_name, email, department } = req.body;

    if (!faculty_name) {
      return res.status(400).json({ message: "Faculty name is required" });
    }

    const [result] = await pool.query(
      "INSERT INTO faculty (faculty_name, email, department) VALUES (?, ?, ?)",
      [faculty_name, email || null, department || null],
    );

    res.status(201).json({
      message: "Faculty added successfully",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ---------------- FACULTY PROFILE ---------------- */
app.get("/api/faculty/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [userRows] = await pool.query(
      "SELECT user_id, name, username, role FROM users WHERE user_id = ? AND role = 'faculty'",
      [id],
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "Faculty user not found" });
    }

    const user = userRows[0];

    const [facultyRows] = await pool.query(
      `
      SELECT
        faculty_id,
        faculty_name,
        email,
        department
      FROM faculty
      WHERE email = ?
      `,
      [user.username],
    );

    if (facultyRows.length === 0) {
      return res.status(404).json({ message: "Faculty profile not found" });
    }

    res.json(facultyRows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ---------------- FACULTY TIMETABLE ---------------- */
app.get("/api/faculty/timetable/:facultyUserId", async (req, res) => {
  try {
    const { facultyUserId } = req.params;

    const [userRows] = await pool.query(
      "SELECT username FROM users WHERE user_id = ? AND role = 'faculty'",
      [facultyUserId],
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "Faculty user not found" });
    }

    const facultyEmail = userRows[0].username;

    const [facultyRows] = await pool.query(
      "SELECT faculty_id FROM faculty WHERE email = ?",
      [facultyEmail],
    );

    if (facultyRows.length === 0) {
      return res.status(404).json({ message: "Faculty record not found" });
    }

    const facultyId = facultyRows[0].faculty_id;

    const [rows] = await pool.query(
      `
      SELECT
        t.timetable_id,
        t.day,
        t.slot_id,
        s.subject_name,
        s.subject_code,
        f.faculty_id,
        f.faculty_name,
        r.room_name,
        sec.section_id,
        sec.section_name,
        sec.branch,
        sec.semester,
        ts.slot_label,
        TIME_FORMAT(ts.start_time, '%H:%i') AS start_time,
        TIME_FORMAT(ts.end_time, '%H:%i') AS end_time,
        ts.slot_order
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.subject_id
      JOIN faculty f ON t.faculty_id = f.faculty_id
      JOIN rooms r ON t.room_id = r.room_id
      JOIN sections sec ON t.section_id = sec.section_id
      JOIN time_slots ts ON t.slot_id = ts.slot_id
      WHERE t.faculty_id = ?
      ORDER BY
        FIELD(t.day, 'Monday','Tuesday','Wednesday','Thursday','Friday'),
        ts.slot_order
      `,
      [facultyId],
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ---------------- SUBJECTS ---------------- */
app.get("/api/subjects", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM subjects ORDER BY subject_id DESC",
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/subjects", async (req, res) => {
  try {
    const { subject_name, subject_code, semester } = req.body;

    if (!subject_name || !subject_code || !semester) {
      return res
        .status(400)
        .json({ message: "All subject fields are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO subjects (subject_name, subject_code, semester) VALUES (?, ?, ?)",
      [subject_name, subject_code, semester],
    );

    res.status(201).json({
      message: "Subject added successfully",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ---------------- ROOMS ---------------- */
app.get("/api/rooms", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM rooms ORDER BY room_id DESC",
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/rooms", async (req, res) => {
  try {
    const { room_name, room_type, capacity } = req.body;

    if (!room_name) {
      return res.status(400).json({ message: "Room name is required" });
    }

    const [result] = await pool.query(
      "INSERT INTO rooms (room_name, room_type, capacity) VALUES (?, ?, ?)",
      [room_name, room_type || null, capacity || null],
    );

    res.status(201).json({
      message: "Room added successfully",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ---------------- SECTIONS ---------------- */
app.get("/api/sections", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM sections ORDER BY section_id DESC",
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/sections", async (req, res) => {
  try {
    const { section_name, semester, branch } = req.body;

    if (!section_name || !semester || !branch) {
      return res
        .status(400)
        .json({ message: "All section fields are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO sections (section_name, semester, branch) VALUES (?, ?, ?)",
      [section_name, semester, branch],
    );

    res.status(201).json({
      message: "Section added successfully",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ---------------- TIME SLOTS ---------------- */
app.get("/api/time-slots", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM time_slots ORDER BY slot_order ASC",
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/time-slots", async (req, res) => {
  try {
    const { slot_label, start_time, end_time, slot_order } = req.body;

    if (!slot_label || !start_time || !end_time || !slot_order) {
      return res
        .status(400)
        .json({ message: "All time slot fields are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO time_slots (slot_label, start_time, end_time, slot_order) VALUES (?, ?, ?, ?)",
      [slot_label, start_time, end_time, slot_order],
    );

    res.status(201).json({
      message: "Time slot added successfully",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ---------------- TIMETABLE ---------------- */
app.get("/api/timetable", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        t.timetable_id,
        t.day,
        t.slot_id,
        t.section_id,
        t.faculty_id,
        s.subject_name,
        s.subject_code,
        f.faculty_name,
        r.room_name,
        sec.section_name,
        sec.branch,
        sec.semester,
        ts.slot_label,
        TIME_FORMAT(ts.start_time, '%H:%i') AS start_time,
        TIME_FORMAT(ts.end_time, '%H:%i') AS end_time,
        ts.slot_order
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.subject_id
      JOIN faculty f ON t.faculty_id = f.faculty_id
      JOIN rooms r ON t.room_id = r.room_id
      JOIN sections sec ON t.section_id = sec.section_id
      JOIN time_slots ts ON t.slot_id = ts.slot_id
      ORDER BY
        FIELD(t.day, 'Monday','Tuesday','Wednesday','Thursday','Friday'),
        ts.slot_order
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/timetable", async (req, res) => {
  try {
    const { day, subject_id, faculty_id, room_id, section_id, slot_id } =
      req.body;

    if (
      !day ||
      !subject_id ||
      !faculty_id ||
      !room_id ||
      !section_id ||
      !slot_id
    ) {
      return res
        .status(400)
        .json({ message: "All timetable fields are required" });
    }

    const [slotRows] = await pool.query(
      "SELECT * FROM time_slots WHERE slot_id = ?",
      [slot_id],
    );

    if (slotRows.length === 0) {
      return res.status(404).json({ message: "Selected time slot not found" });
    }

    if (slotRows[0].slot_label === "Lunch Break") {
      return res
        .status(400)
        .json({ message: "You cannot assign a class during Lunch Break" });
    }

    const [clashRows] = await pool.query(
      `
      SELECT * FROM timetable
      WHERE day = ?
      AND slot_id = ?
      AND (
        faculty_id = ?
        OR room_id = ?
        OR section_id = ?
      )
      `,
      [day, slot_id, faculty_id, room_id, section_id],
    );

    if (clashRows.length > 0) {
      return res.status(400).json({
        message:
          "Clash detected. Faculty, room, or section already booked in this slot.",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO timetable (day, subject_id, faculty_id, room_id, section_id, slot_id)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [day, subject_id, faculty_id, room_id, section_id, slot_id],
    );

    res.status(201).json({
      message: "Timetable entry added successfully",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/timetable/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM timetable WHERE timetable_id = ?", [id]);
    res.json({ message: "Timetable entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ---------------- AUTH ---------------- */
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const [userRows] = await pool.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password],
    );

    if (userRows.length > 0) {
      const user = userRows[0];
      return res.json({
        message: "Login successful",
        user: {
          id: user.user_id,
          name: user.name,
          username: user.username,
          role: user.role,
        },
      });
    }

    const [studentRows] = await pool.query(
      "SELECT * FROM students WHERE username = ? AND password = ?",
      [username, password],
    );

    if (studentRows.length > 0) {
      const student = studentRows[0];
      return res.json({
        message: "Login successful",
        user: {
          id: student.student_id,
          username: student.username,
          role: "student",
        },
      });
    }

    return res.status(401).json({ message: "Invalid username or password" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ---------------- STUDENT PROFILE ---------------- */
app.get("/api/student/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        st.student_id,
        st.full_name,
        st.roll_no,
        st.email,
        st.username,
        sec.section_id,
        sec.section_name,
        sec.branch,
        sec.semester
      FROM students st
      JOIN sections sec ON st.section_id = sec.section_id
      WHERE st.student_id = ?
    `,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ---------------- STUDENT TIMETABLE ---------------- */
app.get("/api/student/timetable/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const [studentRows] = await pool.query(
      "SELECT section_id FROM students WHERE student_id = ?",
      [studentId],
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const sectionId = studentRows[0].section_id;

    const [rows] = await pool.query(
      `
      SELECT
        t.timetable_id,
        t.day,
        t.slot_id,
        t.section_id,
        t.faculty_id,
        s.subject_name,
        s.subject_code,
        f.faculty_name,
        r.room_name,
        ts.slot_label,
        TIME_FORMAT(ts.start_time, '%H:%i') AS start_time,
        TIME_FORMAT(ts.end_time, '%H:%i') AS end_time,
        ts.slot_order
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.subject_id
      JOIN faculty f ON t.faculty_id = f.faculty_id
      JOIN rooms r ON t.room_id = r.room_id
      JOIN time_slots ts ON t.slot_id = ts.slot_id
      WHERE t.section_id = ?
      ORDER BY
        FIELD(t.day, 'Monday','Tuesday','Wednesday','Thursday','Friday'),
        ts.slot_order
    `,
      [sectionId],
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ---------------- SERVER START ---------------- */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});