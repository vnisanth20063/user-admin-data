const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
require("dotenv").config();

const Registration = require("./models/Registration");

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());

// Store admin sessions in MongoDB
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
            secure: false, // For local HTTP development only
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 2, // 2 hours
        },
    })
);

// Check required configuration
if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    throw new Error("ADMIN_PASSWORD and SESSION_SECRET must be set in .env");
}

app.get("/", (req, res) => {
    res.json({ message: "Cinematic Registration API is running!" });
});

// Public: students can submit registrations
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, department } = req.body;

        const registration = await Registration.create({
            name,
            email,
            department,
        });

        res.status(201).json({
            message: "Registration successful!",
            data: registration,
        });
    } catch (error) {
        res.status(400).json({
            message: "Registration failed",
            error: error.message,
        });
    }
});

// Admin login
app.post("/api/admin/login", (req, res, next) => {
    const { password } = req.body;

    if (
        typeof password !== "string" ||
        password !== process.env.ADMIN_PASSWORD
    ) {
        return res.status(401).json({
            message: "Invalid password",
        });
    }

    // Regenerate the session after successful login
    req.session.regenerate((error) => {
        if (error) {
            return next(error);
        }

        req.session.isAdmin = true;

        req.session.save((error) => {
            if (error) {
                return next(error);
            }

            res.json({ message: "Login successful" });
        });
    });
});

// Protect admin-only endpoints
function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin === true) {
        return next();
    }

    return res.status(401).json({
        message: "Please log in as admin",
    });
}

// Check whether the current user is logged in
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

        res.clearCookie("admin.sid", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        res.json({ message: "Logged out successfully" });
    });
});

// Protected: only logged-in admins can fetch registrations
app.get("/api/register", requireAdmin, async (req, res) => {
    try {
        const registrations = await Registration.find().sort({
            createdAt: -1,
        });

        res.status(200).json(registrations);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch registrations",
            error: error.message,
        });
    }
});

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
}

startServer();