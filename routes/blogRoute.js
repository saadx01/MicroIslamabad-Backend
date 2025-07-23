import express from "express";
import {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  addComment
} from "../controllers/blogController.js";

import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

// Public Routes
router.get("/", getAllBlogs);
router.get("/:id", getSingleBlog);

// Admin-Protected Routes
router.post("/", isAuthenticated, authorizeRoles("admin"), createBlog);
router.put("/:id", isAuthenticated, authorizeRoles("admin"), updateBlog);
router.delete("/:id", isAuthenticated, authorizeRoles("admin"), deleteBlog);

// Comment Routes
router.post("/:id", isAuthenticated, addComment);

export default router;
