import { useState } from "react";
import { sql } from "../../../../../lib/db";

export async function getServerSideProps({ params }) {
  const { schoolId, teacherId } = params;

  const students = await sql`
    SELECT id, father_name, student_name, mobile
    FROM students
    WHERE school_id = ${schoolId}
    AND teacher_id = ${teacherId}
    AND talent_hunt_status = 'not_sent'
    ORDER BY record_no
  `;

  return {
    props: {
      students: students || [],
      schoolId,
      teacherId,
    },
  };
}

function cleanMobile(mobile) {
  let m = String(mobile || "").replace(/\D/g, "");
  if (m.length === 10) m = "91" + m;
  return m;
}

function getMessage(father, student) {
  return encodeURIComponent(`Dear ${father},

We are excited to invite ${student} to showcase brilliance at the Quantum Talent Hunt 2026!

Register here:
https://docs.google.com/forms/d/1yz73L_hrZDd7Dt1ZWQJg2gVOOxsDEFca_OxPZyZuYSM/edit

Event Details

Date: 10th May 2026
Venue: Quantum Heights English Medium School, Prakash Nagar, Kadapa
Eligibility: Classes 1 to 10
Entry: FREE (Lunch provided)

Exciting Rewards
Prizes worth ₹50,000
50% Fee Discount for toppers

Scan the QR code to register or contact us for more details:
+91 9390898250
+91 6303507136`);
}

export default function StudentsPage({ students: initialStudents, schoolId, teacherId }) {
  const [students, setStudents] = useState(initialStudents);
  const [loadingId, setLoadingId] = useState(null);

  const handleSend = async (student) => {
    setLoadingId(student.id);

    try {
      const res = await fetch("/api/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, teacherId, schoolId }),
      });

      const data = await res.json();

      if (data.success) {
        setStudents((prev) => prev.filter((s) => s.id !== student.id));

        const mobile = cleanMobile(student.mobile);
        const msg = getMessage(student.father_name, student.student_name);

        window.open(`https://wa.me/${mobile}?text=${msg}`, "_blank");
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-xl font-bold mb-6 text-center">Students</h1>

      {students.length === 0 ? (
        <div className="text-green-600 text-center text-lg font-semibold mt-10">
          All messages sent ✅
        </div>
      ) : (
        <div className="space-y-4 max-w-md mx-auto">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-lg shadow p-4 border border-gray-200"
            >
              <div className="font-semibold text-gray-800">
                {student.student_name}
              </div>

              <div className="text-sm text-gray-500 mb-3">
                Father: {student.father_name}
              </div>

              <button
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
                disabled={loadingId === student.id}
                onClick={() => handleSend(student)}
              >
                {loadingId === student.id ? "Opening..." : "Send WhatsApp"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}