const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors"); // Import cors module
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables from .env file

const app = express();
app.use(express.json());

// CORS setup - Allow specific origin
app.use(
  cors({
    origin: "http://localhost:5173", // Explicitly allow the frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow credentials (cookies, etc.)
  })
);

// MongoDB User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/userdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// User registration route
app.post("/signup-user", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error signing up:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email exists
    const user = await User.findOne({ email });
    if (!user) {
      console.error("User not found:", email); // Log if user is not found
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Entered email:", email);
    console.log("Stored email:", user.email);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error("Invalid credentials:", email); // Log if credentials are invalid
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY || "your_secret_key",
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error("Error logging in:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
