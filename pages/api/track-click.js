import { sql } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { studentId, teacherId, schoolId } = req.body;

    const student = await sql`
      SELECT id, talent_hunt_status
      FROM students
      WHERE id = ${studentId}
      LIMIT 1
    `;

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (student[0].talent_hunt_status !== "sent") {
      await sql`
        INSERT INTO message_logs (
          student_id,
          teacher_id,
          school_id,
          type,
          status
        )
        VALUES (
          ${studentId},
          ${teacherId},
          ${schoolId},
          'talent_hunt',
          'sent'
        )
      `;

      await sql`
        UPDATE students
        SET talent_hunt_status = 'sent'
        WHERE id = ${studentId}
      `;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("TRACK CLICK ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}