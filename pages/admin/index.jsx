import Link from "next/link";
import { sql } from "../../lib/db";

const schoolOrder = [
  "Sri Sai Vignan School",
  "Theja E.M School",
  "Sri Chaitanya E.M School [K4 Branch]",
  "Focus E.M School",
  "Sri Sai Vignan Primary School - Aravind Nagar",
  "Nagarjuna High School",
  "Siva Shivani E.M School",
  "Nagarjuna Model School",
  "Sri Chaitanya E.M School",
  "Sai Baba E.M School",
  "Balavikas E.M School",
  "Gurkul Vidhyapeet School",
  "Eurokids [Pre-primary]",
  "Hello Kids [Pre-primary]",
  "Narayana E-Techno School",
  "Little Flower E.M High School",
  "Hyderabad Public School",
  "Montfort E.M School",
];

const landmarks = {
  "Sri Sai Vignan School": "Vivekananda Nagar (Approx. 1–1.5 km)",
  "Theja E.M School": "Prakash Nagar (Walking distance)",
  "Sri Chaitanya E.M School [K4 Branch]": "Prakash Nagar (Walking distance)",
  "Focus E.M School": "Omshanti Nagar (Approx. 1.5 km)",
  "Sri Sai Vignan Primary School - Aravind Nagar": "Aravind Nagar (Approx. 2 km)",
  "Nagarjuna High School": "Near Sonovision / Maruthi Nagar (Approx. 2.5 km)",
  "Siva Shivani E.M School": "Near Rajiv Mast (Approx. 2.5 km)",
  "Nagarjuna Model School": "Near Court / Maruthi Nagar (Approx. 2.8 km)",
  "Sri Chaitanya E.M School": "Near More, Rajiv Park (Approx. 3 km)",
  "Sai Baba E.M School": "Near ITI Circle (Approx. 3.2 km)",
  "Balavikas E.M School": "Yerramukkapalli (Approx. 3.5 km)",
  "Gurkul Vidhyapeet School": "Near Y-Junction By-pass (Approx. 4 km)",
  "Eurokids [Pre-primary]": "Housing Board Colony (Approx. 4.5 km)",
  "Hello Kids [Pre-primary]": "Housing Board Colony (Approx. 4.5 km)",
  "Narayana E-Techno School": "Housing Board Colony (Approx. 4.5 km)",
  "Little Flower E.M High School": "Housing Board Colony (Approx. 4.5 km)",
  "Hyderabad Public School": "Near Rims Road (Approx. 5.5+ km)",
  "Montfort E.M School": "Near Rims Road (Approx. 5.5+ km)",
};

export async function getServerSideProps() {
  const schools = await sql`
    SELECT 
      sc.id,
      sc.name,
      sc.location,
      COUNT(st.id) AS student_count
    FROM schools sc
    LEFT JOIN students st ON st.school_id = sc.id
    GROUP BY sc.id, sc.name, sc.location
  `;

  const sortedSchools = schools.sort(
    (a, b) => schoolOrder.indexOf(a.name) - schoolOrder.indexOf(b.name)
  );

  return {
    props: {
      schools: sortedSchools.map((s) => ({
        ...s,
        student_count: Number(s.student_count || 0),
      })),
    },
  };
}

export default function AdminPage({ schools }) {
  const totalStudents = schools.reduce((sum, s) => sum + s.student_count, 0);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            School Outreach Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Select a school to view assigned teachers and student WhatsApp list.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">Total Schools</p>
            <p className="text-2xl font-bold">{schools.length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">Total Students</p>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((school, index) => (
            <Link
              key={school.id}
              href={`/admin/schools/${school.id}`}
              className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-green-400 transition"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">Students</p>
                  <p className="font-bold text-gray-900">
                    {school.student_count}
                  </p>
                </div>
              </div>

              <h2 className="font-semibold text-gray-900 leading-snug group-hover:text-green-700">
                {school.name}
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                {landmarks[school.name] || school.location || "Location not added"}
              </p>

              <div className="mt-4 text-sm font-medium text-green-600">
                View Teachers →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}