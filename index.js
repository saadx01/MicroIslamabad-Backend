import express from "express";
import { connectToDatabase } from "./connections/db.js";
import { config } from "dotenv";
import userRoutes from "./routes/userRoute.js";
import blogRoutes from "./routes/blogRoute.js";

import { errorHandler } from './middlewares/errorHandler.js';
import morgan from "morgan";
import logger from "./utils/logger.js";
import cors from "cors";

// Load env variables first
config();
console.log("Frontend url from env:", process.env.FRONTEND_URL);

const app = express();

// Seting up CORS very early
// app.use(cors({
//   origin: [
//     "http://localhost:3000",
//     "http://localhost:5173",
//     "https://micro-islamabad-frontend.vercel.app", // safer to hardcode
//   ],
//   credentials: true,
// }));
app.use(cors({
  origin: "*",
  credentials: true,
}));

// Adding express middleware
app.use(express.json());

// Log origin AFTER cors
app.use((req, res, next) => {
  console.log("Incoming Request Origin:", req.headers.origin);
  next();
});

if (process.env.NODE_ENV !== "test") {
  connectToDatabase();
}

// morgan + custom logger
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/blogs", blogRoutes);

// Error Handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});