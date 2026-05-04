import { useState } from "react";
import Link from "next/link";
import { sql } from "../../../../../lib/db";

export async function getServerSideProps({ params }) {
  const schoolId = params?.schoolId;
  const teacherId = params?.teacherId;

  if (!schoolId || !teacherId) {
    return { notFound: true };
  }

  const students = await sql`
    SELECT 
      id,
      father_name,
      student_name,
      mobile,
      record_no
    FROM alpha_students
    WHERE school_id::text = ${schoolId}
      AND teacher_id::text = ${teacherId}
      AND (
        message_status = 'not_sent'
        OR message_status IS NULL
      )
    ORDER BY record_no ASC
  `;

  const cleanStudents = students.map((s) => ({
    id: String(s.id),
    father_name: s.father_name || "Parent",
    student_name: s.student_name || "Student",
    mobile: s.mobile ? String(s.mobile) : "",
    record_no: Number(s.record_no || 0),
  }));

  return {
    props: {
      students: cleanStudents,
      schoolId: String(schoolId),
      teacherId: String(teacherId),
    },
  };
}

function cleanMobile(mobile) {
  let m = String(mobile || "").replace(/\D/g, "");

  if (m.length === 10) {
    m = "91" + m;
  }

  return m;
}

function getMessage(father, student) {
  return encodeURIComponent(`Dear ${father},

Greetings from Sri Guru Raghavendra English Medium High School, Kadapa.

We are inviting ${student} to explore quality education, strong values, and affordable learning.

For admission details, please contact us.

Thank you.`);
}

export default function AlphaStudentsPage({
  students: initialStudents,
  schoolId,
  teacherId,
}) {
  const [students, setStudents] = useState(initialStudents);
  const [loadingId, setLoadingId] = useState(null);

  const handleSend = async (student) => {
    const mobile = cleanMobile(student.mobile);

    if (!mobile || mobile.length < 12) {
      alert("Invalid mobile number");
      return;
    }

    setLoadingId(student.id);

    const msg = getMessage(student.father_name, student.student_name);
    const whatsappUrl = `https://wa.me/${mobile}?text=${msg}`;

    const newWindow = window.open("", "_blank");

    try {
      const res = await fetch("/api/alpha-track-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: student.id,
          teacherId,
          schoolId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStudents((prev) => prev.filter((s) => s.id !== student.id));

        if (newWindow) {
          newWindow.location.href = whatsappUrl;
        } else {
          window.location.href = whatsappUrl;
        }
      } else {
        alert(data.message || "Failed to save click");
        if (newWindow) newWindow.close();
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
      if (newWindow) newWindow.close();
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="mb-5">
          <Link
            href={`/alpha/schools/${schoolId}`}
            className="text-sm text-green-700 font-semibold hover:underline"
          >
            ← Back to Team Members
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            Pending Records
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Click Send WhatsApp to open the parent message and mark the record as sent.
          </p>
        </div>

        {students.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-4xl mb-3">✅</div>

            <h2 className="text-lg font-bold text-green-700">
              All messages sent
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              No pending WhatsApp records for this team member.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((student, index) => (
              <div
                key={student.id}
                className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-400">
                      Record #{index + 1}
                    </p>

                    <h2 className="font-bold text-gray-900 mt-1">
                      {student.student_name}
                    </h2>
                  </div>

                  <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                    Pending
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">Father:</span>{" "}
                    {student.father_name}
                  </p>

                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">Mobile:</span>{" "}
                    {student.mobile}
                  </p>
                </div>

                <button
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loadingId === student.id}
                  onClick={() => handleSend(student)}
                >
                  {loadingId === student.id
                    ? "Opening WhatsApp..."
                    : "Send WhatsApp"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}