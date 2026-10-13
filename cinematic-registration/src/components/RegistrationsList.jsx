import { useEffect, useState } from "react";

function RegistrationsList() {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/register"
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch registrations");
                }

                const data = await response.json();
                setStudents(data);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };

        fetchStudents();

        const intervalId = setInterval(fetchStudents, 5000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div>
            <h1>Admin Dashboard</h1>

            <p>Total registrations: {students.length}</p>

            {students.map((student) => (
                <div key={student._id}>
                    <p>{student.name}</p>
                    <p>{student.email}</p>
                </div>
            ))}
        </div>
    );
}

export default RegistrationsList;