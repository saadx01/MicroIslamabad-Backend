import express from "express";
import { connectToDatabase } from "./connections/db.js";
import { config } from "dotenv";
import userRoutes from "./routes/userRoute.js";
import blogRoutes from "./routes/blogRoute.js";

import { errorHandler } from './middlewares/errorHandler.js';
import morgan from "morgan";
import logger from "./utils/logger.js";
import cors from "cors";


const app = express();
app.use(express.json());

// configuring environment variables
config();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  })
);

if (process.env.NODE_ENV !== "test") {
 connectToDatabase();
}

// app.use(morgan("dev")); // simple log to console
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// app.get("/", (req, res) => {
//   res.send("Welcome to MicroIslamabad Backend API");
// });

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/blogs", blogRoutes);

app.use(errorHandler); 


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});