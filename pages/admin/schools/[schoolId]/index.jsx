import Link from "next/link";
import { sql } from "../../../../lib/db";
export async function getServerSideProps({ params }) {
  const { schoolId } = params;

  const teachers = await sql`
    SELECT id, name, batch_no
    FROM teachers
    WHERE school_id = ${schoolId}
    ORDER BY batch_no
  `;

  return {
    props: {
      teachers: teachers || [],
      schoolId,
    },
  };
}

export default function TeachersPage({ teachers, schoolId }) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-xl font-bold mb-6 text-center">Teachers</h1>

      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {teachers.length === 0 && (
          <p className="text-center text-gray-500">No teachers found</p>
        )}

        {teachers.map((t) => (
          <Link
            key={t.id}
            href={`/admin/schools/${schoolId}/teachers/${t.id}`}
            className="block bg-white rounded-lg shadow p-4 border border-gray-200"
          >
            <div className="font-semibold text-gray-800">{t.name}</div>
            <div className="text-sm text-gray-500">Batch: {t.batch_no}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}