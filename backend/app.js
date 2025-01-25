// const express = require('express');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const cors = require('cors');

// const app = express();

// // Enable CORS for all origins (can specify more specific origins if needed)
// app.use(cors({
//   origin: 'http://localhost:5173',  // Vite frontend URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,  // Allow cookies and other credentials to be sent
// }));

// app.use(bodyParser.json());

// // MongoDB connection
// mongoose.connect('mongodb://localhost:27017/userdb', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log('Connected to MongoDB');
// }).catch((err) => {
//   console.log('Error connecting to MongoDB:', err);
// });

// // User Schema
// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// const User = mongoose.model('User', userSchema);

// // Sign-up route
// app.post('/api/signup', async (req, res) => {
//   const { username, email, password } = req.body;

//   // Check if the email already exists
//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     return res.status(400).json({ message: 'Email already in use' });
//   }

//   // Hash the password before saving
//   const hashedPassword = await bcrypt.hash(password, 10);

//   // Create a new user
//   const newUser = new User({
//     username,
//     email,
//     password: hashedPassword,
//   });

//   try {
//     await newUser.save();
//     res.status(201).json({ message: 'User signed up successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error signing up user' });
//   }
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const router = express.Router();

const app = express();
app.use(express.json());
app.use(cors()); // Allow cross-origin requests

// MongoDB User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/health_assistant", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// User registration route
// User registration route
router.post("/signup-user", async (req, res) => {
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

    // Redirect to the root ("/") route after successful signup
    res.redirect("/"); // Redirect to the root directory after successful registration
  } catch (err) {
    console.error("Error signing up:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User login route
router.post("/login-user", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT (optional, if needed for session management)
    const token = jwt.sign({ userId: user._id }, "your-secret-key", {
      expiresIn: "1h",
    });

    // Set the token in a cookie or send in response (if needed)
    // res.cookie('auth_token', token, { httpOnly: true }); // Optional

    // Redirect to root directory ("/")
    res.redirect("/");
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      "your-secret-key", // Use a secure secret key
      { expiresIn: "1h" } // Token expiration time (1 hour in this case)
    );

    // Send the JWT token as a response
    res.status(200).json({
      message: "Login successful",
      token: token,
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Register the router with the app
app.use("/api", router);

app.use(express.static("public"));

// Start the server
app.listen(3000, () => console.log("Backend server running on port 3000"));
