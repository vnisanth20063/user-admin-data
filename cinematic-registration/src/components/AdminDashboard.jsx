
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API_URL = "https://user-admin-data-1.onrender.com";

function AdminDashboard() {
    const [registrations, setRegistrations] = useState([]);
    const [checkingSession, setCheckingSession] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("All departments");
    const [sortOrder, setSortOrder] = useState("newest");

    const navigate = useNavigate();

    // Verify the admin's session with Express.
    useEffect(() => {
        let cancelled = false;

        async function checkSession() {
            try {
                const response = await fetch(
                    `${API_URL}/api/admin/session`,
                    { credentials: "include" }
                );

                if (!response.ok) {
                    throw new Error("Could not verify your session.");
                }

                const result = await response.json();

                if (cancelled) return;

                if (result.authenticated) {
                    setAuthenticated(true);
                } else {
                    navigate("/admin", { replace: true });
                }
            } catch {
                if (!cancelled) {
                    navigate("/admin", { replace: true });
                }
            } finally {
                if (!cancelled) {
                    setCheckingSession(false);
                }
            }
        }

        checkSession();

        return () => {
            cancelled = true;
        };
    }, [navigate]);

    // Fetch records only after the session is verified.
    const fetchRegistrations = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/api/register`, {
                credentials: "include",
            });

            if (response.status === 401) {
                setAuthenticated(false);
                navigate("/admin", { replace: true });
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to load student registrations.");
            }

            const data = await response.json();
            setRegistrations(data);
        } catch (err) {
            setError(err.message || "Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (authenticated) {
            fetchRegistrations();
        }
    }, [authenticated, fetchRegistrations]);

    // Log out by destroying the backend session.
    async function handleLogout() {
        setError("");

        try {
            const response = await fetch(`${API_URL}/api/admin/logout`, {
                method: "POST",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Logout failed. Please try again.");
            }

            setAuthenticated(false);
            setRegistrations([]);
            navigate("/admin", { replace: true });
        } catch (err) {
            setError(err.message || "Unable to log out.");
        }
    }

    const departments = [
        "All departments",
        ...new Set(
            registrations
                .map((item) => item.department)
                .filter(Boolean)
        ),
    ];

    const filteredRegistrations = registrations
        .filter((item) => {
            const term = search.trim().toLowerCase();

            const matchesSearch =
                !term ||
                [item.name, item.email, item.department].some((value) =>
                    String(value || "").toLowerCase().includes(term)
                );

            const matchesDepartment =
                department === "All departments" ||
                item.department === department;

            return matchesSearch && matchesDepartment;
        })
        .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();

            return sortOrder === "newest"
                ? dateB - dateA
                : dateA - dateB;
        });

    const recentCount = registrations.filter((item) => {
        if (!item.createdAt) return false;

        const registeredAt = new Date(item.createdAt).getTime();
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        return registeredAt >= sevenDaysAgo;
    }).length;

    if (checkingSession) {
        return (
            <main className="admin-loading-screen">
                <div className="loading-orb" />
                <p>Verifying admin session...</p>
            </main>
        );
    }

    if (!authenticated) {
        return null;
    }

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <a className="admin-brand" href="/admin/dashboard">
                    <span className="brand-mark">C</span>
                    <span>
                        <strong>CampusConnect</strong>
                        <small>ADMIN CONSOLE</small>
                    </span>
                </a>

                <div className="sidebar-label">WORKSPACE</div>

                <nav className="sidebar-nav" aria-label="Admin navigation">
                    <a className="sidebar-link active" href="#overview">
                        <span className="nav-icon">▦</span>
                        Overview
                    </a>

                    <a className="sidebar-link" href="#registrations">
                        <span className="nav-icon">♙</span>
                        Registrations
                        <span className="nav-count">
                            {registrations.length}
                        </span>
                    </a>
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-status">
                        <span className="status-dot" />
                        <span>
                            <strong>System connected</strong>
                            <small>Admin session active</small>
                        </span>
                    </div>

                    <button
                        className="sidebar-logout"
                        type="button"
                        onClick={handleLogout}
                    >
                        <span className="nav-icon">↪</span>
                        Sign out
                    </button>

                    <div className="sidebar-footer">
                        CAMPUSCONNECT <span>·</span> ADMIN
                    </div>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="breadcrumb">
                        Workspace <span>/</span> <strong>Overview</strong>
                    </div>

                    <div className="topbar-right">
                        <span className="live-indicator">
                            <span className="status-dot" />
                            Live dashboard
                        </span>

                        <div className="admin-avatar" title="Administrator">
                            A
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    <section className="welcome-section" id="overview">
                        <div>
                            <p className="eyebrow">YOUR CAMPUS AT A GLANCE</p>
                            <h1>Dashboard <span>overview.</span></h1>
                            <p className="welcome-description">
                                Monitor registrations and keep everything
                                organized in one place.
                            </p>
                        </div>

                        <button
                            className="glass-button refresh-button"
                            type="button"
                            onClick={fetchRegistrations}
                            disabled={loading}
                        >
                            <span className={loading ? "spin-icon" : ""}>
                                ↻
                            </span>
                            {loading ? "Refreshing..." : "Refresh data"}
                        </button>
                    </section>

                    {error && (
                        <div className="admin-alert" role="alert">
                            <span>!</span>
                            <p>{error}</p>
                            <button
                                type="button"
                                onClick={fetchRegistrations}
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    <section
                        className="stats-grid"
                        aria-label="Registration statistics"
                    >
                        <article className="glass-panel stat-card">
                            <div className="stat-card-top">
                                <span>Total registrations</span>
                                <span className="stat-icon violet">♙</span>
                            </div>
                            <div className="stat-number">
                                {registrations.length}
                            </div>
                            <p className="stat-footnote">
                                All saved student records
                            </p>
                            <div className="stat-decoration violet-glow" />
                        </article>

                        <article className="glass-panel stat-card">
                            <div className="stat-card-top">
                                <span>Last 7 days</span>
                                <span className="stat-icon blue">◷</span>
                            </div>
                            <div className="stat-number">{recentCount}</div>
                            <p className="stat-footnote">
                                Recent registrations
                            </p>
                            <div className="stat-decoration blue-glow" />
                        </article>

                        <article className="glass-panel stat-card">
                            <div className="stat-card-top">
                                <span>Departments</span>
                                <span className="stat-icon pink">⌘</span>
                            </div>
                            <div className="stat-number">
                                {new Set(
                                    registrations
                                        .map((item) => item.department)
                                        .filter(Boolean)
                                ).size}
                            </div>
                            <p className="stat-footnote">
                                Represented in registrations
                            </p>
                            <div className="stat-decoration pink-glow" />
                        </article>
                    </section>

                    <section
                        className="glass-panel registrations-panel"
                        id="registrations"
                    >
                        <div className="table-heading">
                            <div>
                                <p className="eyebrow">STUDENT DIRECTORY</p>
                                <h2>Registrations</h2>
                                <p className="table-subtitle">
                                    Browse and organize registered students.
                                </p>
                            </div>

                            <span className="record-badge">
                                {filteredRegistrations.length} records
                            </span>
                        </div>

                        <div className="table-toolbar">
                            <label className="search-box">
                                <span aria-hidden="true">⌕</span>
                                <input
                                    type="search"
                                    placeholder="Search name, email, department..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    aria-label="Search registrations"
                                />
                            </label>

                            <label className="filter-control">
                                <span className="sr-only">Department</span>
                                <select
                                    value={department}
                                    onChange={(event) =>
                                        setDepartment(event.target.value)
                                    }
                                >
                                    {departments.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="filter-control sort-control">
                                <span className="sr-only">Sort by date</span>
                                <select
                                    value={sortOrder}
                                    onChange={(event) =>
                                        setSortOrder(event.target.value)
                                    }
                                >
                                    <option value="newest">Newest first</option>
                                    <option value="oldest">Oldest first</option>
                                </select>
                            </label>
                        </div>

                        {loading && registrations.length === 0 ? (
                            <div className="table-message">
                                <div className="loading-orb" />
                                <p>Loading registrations...</p>
                            </div>
                        ) : filteredRegistrations.length === 0 ? (
                            <div className="table-message">
                                <div className="empty-icon">⌕</div>
                                <h3>
                                    {registrations.length === 0
                                        ? "No registrations yet"
                                        : "No matching students"}
                                </h3>
                                <p>
                                    {registrations.length === 0
                                        ? "New student registrations will appear here."
                                        : "Try another search term or department."}
                                </p>
                                {search ||
                                    department !== "All departments" ? (
                                    <button
                                        className="glass-button"
                                        type="button"
                                        onClick={() => {
                                            setSearch("");
                                            setDepartment("All departments");
                                        }}
                                    >
                                        Clear filters
                                    </button>
                                ) : null}
                            </div>
                        ) : (
                            <div className="table-scroll">
                                <table className="registration-table">
                                    <thead>
                                        <tr>
                                            <th>STUDENT</th>
                                            <th>EMAIL ADDRESS</th>
                                            <th>DEPARTMENT</th>
                                            <th>REGISTERED</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredRegistrations.map(
                                            (registration) => (
                                                <tr key={registration._id}>
                                                    <td>
                                                        <div className="student-cell">
                                                            <span className="student-avatar">
                                                                {String(
                                                                    registration.name ||
                                                                    "S"
                                                                )
                                                                    .trim()
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </span>
                                                            <strong>
                                                                {registration.name ||
                                                                    "Unnamed student"}
                                                            </strong>
                                                        </div>
                                                    </td>

                                                    <td className="email-cell">
                                                        {registration.email ||
                                                            "—"}
                                                    </td>

                                                    <td>
                                                        <span className="department-pill">
                                                            {registration.department ||
                                                                "Not specified"}
                                                        </span>
                                                    </td>

                                                    <td className="date-cell">
                                                        {registration.createdAt
                                                            ? new Date(
                                                                registration.createdAt
                                                            ).toLocaleDateString(
                                                                undefined,
                                                                {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                }
                                                            )
                                                            : "—"}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <footer className="table-footer">
                            <span>
                                Showing {filteredRegistrations.length} of{" "}
                                {registrations.length} registrations
                            </span>
                            <span className="secure-label">
                                <span className="status-dot" />
                                Secure admin view
                            </span>
                        </footer>
                    </section>

                    <footer className="main-footer">
                        <span>© {new Date().getFullYear()} CampusConnect</span>
                        <span>Built for your campus community.</span>
                    </footer>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;
