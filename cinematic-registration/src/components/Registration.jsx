
import { useEffect, useState } from "react";
import "./Registration.css";

const DEPARTMENTS = [
    ["CSE", "Computer Science (CSE)"],
    ["IT", "Information Technology (IT)"],
    ["ECE", "Electronics (ECE)"],
    ["EEE", "Electrical (EEE)"],
    ["MECH", "Mechanical Engineering"],
    ["CIVIL", "Civil Engineering"],
    ["OTHER", "Other"],
];

export default function Registration() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        department: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [pointer, setPointer] = useState({ x: 0, y: 0 });

    // Mouse movement creates a subtle parallax effect.
    useEffect(() => {
        if (!window.matchMedia("(pointer: fine)").matches) return;

        let frame = 0;

        function handleMouseMove(event) {
            cancelAnimationFrame(frame);

            frame = requestAnimationFrame(() => {
                setPointer({
                    x: (event.clientX / window.innerWidth - 0.5) * 2,
                    y: (event.clientY / window.innerHeight - 0.5) * 2,
                });
            });
        }

        window.addEventListener("mousemove", handleMouseMove, {
            passive: true,
        });

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(frame);
        };
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (message) setMessage("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading) return;

        setLoading(true);
        setMessage("");
        setSuccess(false);

        try {
            const response = await fetch(
                "http://localhost:5000/api/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Registration failed. Please try again."
                );
            }

            setSuccess(true);
            setMessage(
                data.message || "Registration completed successfully!"
            );

            setFormData({
                name: "",
                email: "",
                department: "",
            });
        } catch (error) {
            setSuccess(false);

            setMessage(
                error instanceof TypeError
                    ? "Unable to connect to the server. Check that the backend is running."
                    : error.message ||
                    "Unable to complete registration. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main
            className="campus-page"
            style={{
                "--mouse-x": `${pointer.x * 7}px`,
                "--mouse-y": `${pointer.y * 7}px`,
            }}
        >
            {/* Animated background stars */}
            <div className="star-layer" aria-hidden="true">
                {Array.from({ length: 48 }, (_, i) => (
                    <span
                        key={i}
                        className="star"
                        style={{
                            "--x": `${(i * 37 + 11) % 100}%`,
                            "--y": `${(i * 53 + 7) % 100}%`,
                            "--delay": `${(i % 9) * -0.7}s`,
                            "--duration": `${2 + (i % 4)}s`,
                        }}
                    />
                ))}

                <span className="shooting-star shooting-star-one" />
                <span className="shooting-star shooting-star-two" />
            </div>

            {/* Moonlight, clouds and floating particles */}
            <div className="night-effects" aria-hidden="true">
                <div className="moon-glow" />
                <div className="moon" />
                <div className="cloud cloud-one" />
                <div className="cloud cloud-two" />

                {Array.from({ length: 14 }, (_, i) => (
                    <span
                        key={`particle-${i}`}
                        className="magic-particle"
                        style={{
                            "--x": `${(i * 41 + 13) % 100}%`,
                            "--delay": `${-(i % 8)}s`,
                            "--duration": `${9 + (i % 5)}s`,
                            "--drift": `${(i % 2 ? 1 : -1) * (12 + (i % 4) * 7)
                                }px`,
                        }}
                    />
                ))}
            </div>

            {/* Header */}
            <header className="campus-header">
                <a
                    href="/"
                    className="campus-brand"
                    aria-label="CampusConnect home"
                >
                    <span className="brand-icon">C</span>
                    <span>
                        CAMPUS
                        <span className="brand-accent">CONNECT</span>
                    </span>
                </a>

                <span className="system-status">
                    <span className="status-dot" />
                    CAMPUS PORTAL ONLINE
                </span>
            </header>

            {/* Main content */}
            <section className="registration-layout">
                <div className="campus-intro" aria-hidden="true">
                    <div className="eyebrow">
                        <span className="eyebrow-line" />
                        YOUR NEXT CHAPTER STARTS HERE
                    </div>

                    <h1>
                        Enter your
                        <br />
                        <span className="gradient-text">
                            next dimension.
                        </span>
                    </h1>

                    <p className="intro-description">
                        Your campus journey begins with one step. Join a
                        community built for ideas, discovery, and the future.
                    </p>

                    <div className="campus-visual">
                        <div className="visual-sun" />

                        <div className="campus-building building-left">
                            <div className="building-windows" />
                        </div>

                        <div className="campus-building building-center">
                            <div className="building-roof" />
                            <div className="building-windows" />
                            <div className="building-entrance" />
                        </div>

                        <div className="campus-building building-right">
                            <div className="building-windows" />
                        </div>

                        <div className="campus-ground" />

                        <div className="visual-label">
                            <span className="status-dot" />
                            YOUR FUTURE CAMPUS
                        </div>
                    </div>

                    <div className="intro-footer">
                        <span>DISCOVER</span>
                        <span className="footer-divider" />
                        <span>CONNECT</span>
                        <span className="footer-divider" />
                        <span>GROW</span>
                    </div>
                </div>

                {/* Registration form */}
                <div className="registration-card">
                    <div className="card-topline">
                        <span className="card-step">01 / 01</span>
                        <span className="card-tag">STUDENT ACCESS</span>
                    </div>

                    <div className="card-heading">
                        <div className="card-icon" aria-hidden="true">
                            ✳
                        </div>

                        <h2>Join the campus.</h2>
                        <p>Let's get to know you.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label htmlFor="name">FULL NAME</label>

                            <div className="input-shell">
                                <span className="input-icon" aria-hidden="true">
                                    ✧
                                </span>

                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    autoComplete="name"
                                    maxLength={100}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="email">EMAIL ADDRESS</label>

                            <div className="input-shell">
                                <span className="input-icon" aria-hidden="true">
                                    @
                                </span>

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    maxLength={254}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="department">DEPARTMENT</label>

                            <div className="input-shell select-shell">
                                <span className="input-icon" aria-hidden="true">
                                    ⌘
                                </span>

                                <select
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" disabled>
                                        Choose your department
                                    </option>

                                    {DEPARTMENTS.map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >
                            <span>
                                {loading
                                    ? "Creating your profile..."
                                    : "Start your journey"}
                            </span>

                            <span className="button-arrow" aria-hidden="true">
                                {loading ? "…" : "↗"}
                            </span>
                        </button>

                        {message && (
                            <div
                                className={`form-message ${success ? "message-success" : "message-error"
                                    }`}
                                role={success ? "status" : "alert"}
                                aria-live="polite"
                            >
                                <span aria-hidden="true">
                                    {success ? "✓" : "!"}
                                </span>
                                {message}
                            </div>
                        )}
                    </form>

                    <div className="card-bottom">
                        <span className="secure-symbol" aria-hidden="true">
                            ◇
                        </span>
                        Your information is submitted securely.
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="campus-footer">
                <span>
                    © {new Date().getFullYear()} CAMPUSCONNECT
                </span>

                <span className="footer-center">
                    DESIGNED FOR WHAT'S NEXT
                </span>

                <a href="/admin" className="admin-link">
                    ADMIN ACCESS ↗
                </a>
            </footer>
        </main>
    );
}
