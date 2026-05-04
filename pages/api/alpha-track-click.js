import { sql } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { studentId, teacherId, schoolId } = req.body;

    await sql`
      UPDATE alpha_students
      SET message_status = 'sent'
      WHERE id = ${studentId}
      AND teacher_id = ${teacherId}
      AND school_id = ${schoolId}
    `;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Alpha track click error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}