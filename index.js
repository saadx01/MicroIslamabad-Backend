import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ CORS setup to allow your frontend
app.use(cors({
  origin: "https://micro-islamabad-frontend.vercel.app",
  credentials: true,
}));

// ✅ Basic middleware
app.use(express.json());

// ✅ Root route to test Railway health
app.get("/", (req, res) => {
  res.send("✅ MicroIslamabad Backend is working!");
});

// ✅ Dummy test route to simulate API call
app.get("/v1/test", (req, res) => {
  res.json({
    success: true,
    message: "Test route reached successfully!",
  });
});

// ❌ Skipping database connection temporarily
// import { connectToDatabase } from "./config/db.js";
// connectToDatabase(); // <-- commented out for debugging

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
