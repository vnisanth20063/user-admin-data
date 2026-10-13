import { useEffect, useState } from "react";

const API_URL = "https://user-admin-data-1.onrender.com";

function RegistrationsList() {
    const [students, setStudents] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchStudents = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/register`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to fetch registrations"
                    );
                }

                if (isMounted) {
                    setStudents(data);
                    setError("");
                }
            } catch (error) {
                console.error("Error fetching students:", error);

                if (isMounted) {
                    setError(error.message || "Unable to connect to the server");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchStudents();

        const intervalId = setInterval(fetchStudents, 5000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    return (
        <div>
            <h1>Admin Dashboard</h1>

            {loading && <p>Loading registrations...</p>}

            {error && <p>{error}</p>}

            {!loading && !error && (
                <>
                    <p>Total registrations: {students.length}</p>

                    {students.map((student) => (
                        <div key={student._id}>
                            <p>{student.name}</p>
                            <p>{student.email}</p>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

export default RegistrationsList;