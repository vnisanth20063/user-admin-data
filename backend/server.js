const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
require("dotenv").config();

const Registration = require("./models/Registration");

const app = express();

// Required when running behind Render's proxy
app.set("trust proxy", 1);

// Frontend URLs allowed to access the backend
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests without an Origin header, such as server-side requests
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

app.use(express.json());

// Session configuration
const isProduction = process.env.NODE_ENV === "production";

app.use(
    session({
        name: "admin.sid",
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,

        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: "sessions",
        }),

        cookie: {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 1000 * 60 * 60 * 2,
        },
    })
);

// Check required environment variables
if (
    !process.env.MONGO_URI ||
    !process.env.ADMIN_PASSWORD ||
    !process.env.SESSION_SECRET
) {
    throw new Error(
        "Missing MONGO_URI, ADMIN_PASSWORD, or SESSION_SECRET in environment variables."
    );
}

// Reuse cookie settings when clearing the session cookie
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
};

// Backend health check
app.get("/", (req, res) => {
    res.json({
        message: "Cinematic Registration API is running!",
    });
});

// Register a new user
app.post("/api/register", async (req, res) => {
    try {
        const registration = await Registration.create(req.body);

        res.status(201).json({
            message: "Registration successful",
            registration,
        });
    } catch (error) {
        console.error("Registration error:", error.message);

        res.status(400).json({
            message: "Registration failed",
            error: error.message,
        });
    }
});

// Admin login
app.post("/api/admin/login", (req, res, next) => {
    const { password } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({
            message: "Invalid admin password",
        });
    }

    req.session.regenerate((error) => {
        if (error) {
            return next(error);
        }

        req.session.isAdmin = true;

        req.session.save((saveError) => {
            if (saveError) {
                return next(saveError);
            }

            res.json({
                message: "Admin login successful",
                authenticated: true,
            });
        });
    });
});

// Middleware to protect admin routes
function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin === true) {
        return next();
    }

    return res.status(401).json({
        message: "Unauthorized. Please log in as admin.",
    });
}

// Check whether the admin session is active
app.get("/api/admin/session", (req, res) => {
    res.json({
        authenticated: req.session?.isAdmin === true,
    });
});

// Admin logout
app.post("/api/admin/logout", requireAdmin, (req, res, next) => {
    req.session.destroy((error) => {
        if (error) {
            return next(error);
        }

        res.clearCookie("admin.sid", cookieOptions);

        res.json({
            message: "Logged out successfully",
        });
    });
});

// Get all registrations (admin only)
app.get("/api/register", requireAdmin, async (req, res) => {
    try {
        const registrations = await Registration.find().sort({
            createdAt: -1,
        });

        res.json(registrations);
    } catch (error) {
        console.error("Fetching registrations error:", error.message);

        res.status(500).json({
            message: "Failed to fetch registrations",
        });
    }
});

// Handle unexpected errors
app.use((error, req, res, next) => {
    console.error("Server error:", error.message);

    if (res.headersSent) {
        return next(error);
    }

    res.status(500).json({
        message: "Internal server error",
    });
});

// Connect to MongoDB and start the server
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
}

startServer();