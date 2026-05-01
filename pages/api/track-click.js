import { sql } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { studentId, teacherId, schoolId } = req.body;
  if (!studentId || !teacherId || !schoolId) return res.status(400).json({ error: "Missing fields" });

  // Check if already sent
  const check = await sql(
    `SELECT talent_hunt_status FROM students WHERE id = $1`,
    [studentId]
  );
  if (!check.rows.length || check.rows[0].talent_hunt_status === "sent") {
    return res.json({ success: true });
  }

  // Get student details
  const student = await sql(
    `SELECT id, father_name, student_name, mobile FROM students WHERE id = $1`,
    [studentId]
  );
  if (!student.rows.length) return res.status(404).json({ error: "Student not found" });

  // Insert log
  await sql(
    `INSERT INTO message_logs (student_id, teacher_id, school_id, sent_at) VALUES ($1, $2, $3, NOW())`,
    [studentId, teacherId, schoolId]
  );

  // Update student status
  await sql(
    `UPDATE students SET talent_hunt_status = 'sent' WHERE id = $1`,
    [studentId]
  );

  return res.json({ success: true });
}
