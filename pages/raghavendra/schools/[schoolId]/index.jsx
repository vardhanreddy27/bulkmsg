import Link from "next/link";
import { sql } from "../../../../lib/db";

export async function getServerSideProps({ params }) {
  const { schoolId } = params;

  const school = await sql`
    SELECT name 
    FROM raghavendra_schools 
    WHERE id = ${schoolId} 
    LIMIT 1
  `;

  const teachers = await sql`
    SELECT 
      t.id,
      t.name,
      t.batch_no,
      COUNT(s.id) AS total_records,
      SUM(CASE WHEN s.message_status = 'sent' THEN 1 ELSE 0 END) AS sent_count,
      SUM(CASE WHEN s.message_status = 'not_sent' THEN 1 ELSE 0 END) AS pending_count
    FROM raghavendra_teachers t
    LEFT JOIN raghavendra_students s ON s.teacher_id = t.id
    WHERE t.school_id = ${schoolId}
    GROUP BY t.id, t.name, t.batch_no
    ORDER BY t.batch_no
  `;

  return {
    props: {
      schoolName: school[0]?.name || "School",
      teachers: teachers.map((t) => ({
        ...t,
        total_records: Number(t.total_records || 0),
        sent_count: Number(t.sent_count || 0),
        pending_count: Number(t.pending_count || 0),
      })),
      schoolId,
    },
  };
}

export default function RaghavendraTeachersPage({
  teachers,
  schoolId,
  schoolName,
}) {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/raghavendra" className="text-sm text-green-600 font-medium">
            ← Back to Schools
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mt-3">
            {schoolName}
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Select a team member to view pending WhatsApp records.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t) => {
            const progress =
              t.total_records > 0
                ? Math.round((t.sent_count / t.total_records) * 100)
                : 0;

            return (
              <Link
                key={t.id}
                href={`/raghavendra/schools/${schoolId}/teachers/${t.id}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-green-400 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">
                      Batch {t.batch_no}
                    </p>
                    <h2 className="text-lg font-bold text-gray-900 mt-1">
                      {t.name}
                    </h2>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                    {t.pending_count}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-5 text-center">
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="font-bold">{t.total_records}</p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-2">
                    <p className="text-xs text-gray-500">Sent</p>
                    <p className="font-bold text-green-700">{t.sent_count}</p>
                  </div>

                  <div className="bg-orange-50 rounded-xl p-2">
                    <p className="text-xs text-gray-500">Pending</p>
                    <p className="font-bold text-orange-700">
                      {t.pending_count}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    {progress}% completed
                  </p>
                </div>

                <div className="mt-4 text-sm font-medium text-green-600">
                  View Records →
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}