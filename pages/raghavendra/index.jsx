import Link from "next/link";
import { sql } from "../../lib/db";

export async function getServerSideProps() {
  const schools = await sql`
    SELECT 
      sc.id,
      sc.name,
      sc.landmark,
      sc.display_order,
      COUNT(st.id) AS student_count
    FROM raghavendra_schools sc
    LEFT JOIN raghavendra_students st ON st.school_id = sc.id
    GROUP BY sc.id, sc.name, sc.landmark, sc.display_order
    ORDER BY sc.display_order
  `;

  return {
    props: {
      schools: schools.map((s) => ({
        ...s,
        student_count: Number(s.student_count || 0),
      })),
    },
  };
}

export default function RaghavendraPage({ schools }) {
  const totalStudents = schools.reduce((sum, s) => sum + s.student_count, 0);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Raghavendra Outreach Dashboard
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Select a school to view assigned team members and student WhatsApp list.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">Total Schools</p>
            <p className="text-2xl font-bold">{schools.length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">Total Records</p>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => (
            <Link
              key={school.id}
              href={`/raghavendra/schools/${school.id}`}
              className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-green-400 transition"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                  {school.display_order}
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">Records</p>
                  <p className="font-bold text-gray-900">
                    {school.student_count}
                  </p>
                </div>
              </div>

              <h2 className="font-semibold text-gray-900 leading-snug group-hover:text-green-700">
                {school.name}
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                {school.landmark || "Location not added"}
              </p>

              <div className="mt-4 text-sm font-medium text-green-600">
                View Team →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}