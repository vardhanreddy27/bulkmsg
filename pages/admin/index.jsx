import Link from "next/link";
import { sql } from "../../lib/db";

export async function getServerSideProps() {
  const schools = await sql`
    SELECT id, name, location
    FROM schools
    ORDER BY name
  `;

  return {
    props: { schools },
  };
}

export default function AdminPage({ schools }) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6">Schools</h1>

      <div className="grid gap-4">
        {schools.map((school) => (
          <Link
            key={school.id}
            href={`/admin/schools/${school.id}`}
            className="bg-white p-4 rounded-xl shadow border block"
          >
            <h2 className="font-semibold">{school.name}</h2>
            {school.location && (
              <p className="text-sm text-gray-500">
                {school.location}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}