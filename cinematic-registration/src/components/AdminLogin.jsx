import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const API_URL = "https://user-admin-data-1.onrender.com";

function AdminLogin() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleLogin(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/admin/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ password }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Login failed"
                );
            }

            navigate("/admin/dashboard");
        } catch (error) {
            setError(
                error.message || "Unable to connect to the server"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="admin-login-page">
            <form
                className="admin-login-card"
                onSubmit={handleLogin}
            >
                <h1>Admin Login</h1>
                <p>Sign in to manage student registrations.</p>

                <label htmlFor="admin-password">
                    Password
                </label>

                <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
                    placeholder="Enter admin password"
                    required
                />

                {error && (
                    <p className="login-error">
                        {error}
                    </p>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>
        </main>
    );
}

export default AdminLogin;