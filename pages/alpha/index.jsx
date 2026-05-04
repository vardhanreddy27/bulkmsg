import Link from "next/link";
import { sql } from "../../lib/db";

export async function getServerSideProps() {
  const schools = await sql`
    SELECT 
      sc.id,
      sc.name,
      sc.landmark,
      sc.display_order,

      COUNT(st.id) AS student_count,

      SUM(
        CASE 
          WHEN st.message_status = 'sent' THEN 1 
          ELSE 0 
        END
      ) AS sent_count,

      SUM(
        CASE 
WHEN st.message_status = 'not_sent' OR st.message_status IS NULL THEN 1          ELSE 0 
        END
      ) AS pending_count

    FROM alpha_schools sc
    LEFT JOIN alpha_students st 
      ON st.school_id = sc.id

    GROUP BY sc.id, sc.name, sc.landmark, sc.display_order
    ORDER BY sc.display_order
  `;

  return {
    props: {
      schools: schools.map((s) => ({
        ...s,
        student_count: Number(s.student_count || 0),
        sent_count: Number(s.sent_count || 0),
        pending_count: Number(s.pending_count || 0),
      })),
    },
  };
}

export default function AlphaPage({ schools }) {
    const totalStudents = schools.reduce(
    (sum, s) => sum + s.student_count,
    0
  );

  const totalSent = schools.reduce(
    (sum, s) => sum + s.sent_count,
    0
  );

  const totalPending = schools.reduce(
    (sum, s) => sum + s.pending_count,
    0
  );

  const overallProgress =
    totalStudents > 0 ? Math.round((totalSent / totalStudents) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            alpha Outreach Dashboard
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Select a school to view assigned team members and student WhatsApp list.
          </p>
        </div>

        {/* Overall Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">Total Schools</p>
            <p className="text-2xl font-bold">{schools.length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">Total Records</p>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">Sent</p>
            <p className="text-2xl font-bold text-green-700">{totalSent}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-orange-700">
              {totalPending}
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-800">
              Overall Progress
            </p>
            <p className="text-sm font-bold text-green-700">
              {overallProgress}% completed
            </p>
          </div>

          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-green-500 h-3 rounded-full"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* School Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => {
            const progress =
              school.student_count > 0
                ? Math.round((school.sent_count / school.student_count) * 100)
                : 0;

            return (
              <Link
                key={school.id}
                href={`/alpha/schools/${school.id}`}
                className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-green-400 transition"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                    {school.display_order}
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="font-bold text-green-700">
                      {progress}%
                    </p>
                  </div>
                </div>

                <h2 className="font-semibold text-gray-900 leading-snug group-hover:text-green-700">
                  {school.name}
                </h2>

                <div className="grid grid-cols-3 gap-2 mt-5 text-center">
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="font-bold">{school.student_count}</p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-2">
                    <p className="text-xs text-gray-500">Sent</p>
                    <p className="font-bold text-green-700">
                      {school.sent_count}
                    </p>
                  </div>

                  <div className="bg-orange-50 rounded-xl p-2">
                    <p className="text-xs text-gray-500">Pending</p>
                    <p className="font-bold text-orange-700">
                      {school.pending_count}
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
                  View Team →
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}