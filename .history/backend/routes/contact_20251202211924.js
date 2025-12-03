const router = require('express').Router();
const Contact = require("../models/contact");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Login = require("../models/login");

const JWT_SECRET = "your_secret_key_here";

// AUTH MIDDLEWARE
const authMiddleware = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// SIGNUP
router.post('/', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await Contact.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newContact = new Contact({ name, email, password: hashedPassword });
        await newContact.save();

        const token = jwt.sign(
            { id: newContact._id, email: newContact.email, role: newContact.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "Signup successful", token });
    } catch (error) {
        res.status(400).json({ message: "Error saving contact" });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Contact.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        // Access Token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Refresh Token (now includes email)
        const refreshToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        await Login.create({
            userId: user._id,
            token,
            refreshToken,
            name: user.name,
            email: user.email,
            role: user.role
        });

        res.status(200).json({ message: "Login successful", token, refreshToken });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// GET ALL USERS (ADMIN ONLY)
router.get('/all', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only" });
        }

        const users = await Contact.find({});
        res.status(200).json(users);

    } catch (error) {
        res.status(500).json({ message: "Server error while fetching users" });
    }
});

// REFRESH TOKEN ENDPOINT
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken)
        return res.status(401).json({ message: "No refresh token provided" });

    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);

        const tokenInDB = await Login.findOne({
            userId: decoded.id,
            refreshToken
        });

        if (!tokenInDB)
            return res.status(403).json({ message: "Invalid refresh token" });

        // New Access Token (now includes email)
        const newToken = jwt.sign(
            { id: decoded.id, email: decoded.email, role: decoded.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ token: newToken });
    } catch (error) {
        res.status(403).json({ message: "Refresh token expired or invalid" });
    }
});

module.exports = router;
