import BlogModel from "../models/blogModel.js";
import mongoose from "mongoose";


// @desc    Create new blog
export const createBlog = async (req, res) => {
    try {
        const { title, sector, category, coverImage, content, tags } = req.body;

        if (!title || !sector || !category || !coverImage || !content) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }

        const author = req.user.id; // assuming you've authenticated the user

        const blog = new BlogModel({
            title,
            sector,
            category,
            coverImage,
            content,
            tags,
            author,
        });

        await blog.save();

        res.status(201).json({
            success: true,
            message: "Blog created successfully",
            blog,
        });
    } catch (err) {
        console.error("Error creating blog:", err);
        res.status(500).json({
            success: false,
            message: "Failed to create blog",
            error: err.message,
        });
    }
};

// @desc    Get all blogs
export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await BlogModel.find()
            .populate("author", "name email") // show author's name/email
            .sort({ createdAt: -1 });

        if (!blogs || blogs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No blogs found",
            });
        }

        res.status(200).json({
            success: true,
            data: blogs,
        });
    } catch (err) {
        console.error("Error fetching blogs:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch blogs",
            error: err.message,
        });
    }
};

// @desc    Get single blog
export const getSingleBlog = async (req, res) => {
    try {
        const blogId = req.params.id;
        if (!blogId) {
            return res.status(400).json({
                success: false,
                message: "Blog ID is required"
            });
        }

        const blog = await BlogModel.findById(blogId)
        .populate("author", "name email")
        .populate("comments.user", "name profileImage ");

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        res.status(200).json({
            success: true,
            data: blog,
        });
    } catch (err) {
        console.error("Error fetching blog:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch blog",
            error: err.message,
        });
    }
};

// @desc    Update blog
export const updateBlog = async (req, res) => {
    try {
        const blogId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID format"
            });
        }

        const { title, sector, category, coverImage, content, tags } = req.body;

        // Build update object only with provided fields
        const updates = {};
        if (title !== undefined) updates.title = title;
        if (sector !== undefined) updates.sector = sector;
        if (category !== undefined) updates.category = category;
        if (coverImage !== undefined) updates.coverImage = coverImage;
        if (content !== undefined) updates.content = content;
        if (tags !== undefined) updates.tags = tags;

        const updatedBlog = await BlogModel.findByIdAndUpdate(
            blogId,
            updates,
            { new: true }
        );

        if (!updatedBlog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            blog: updatedBlog,
        });
    } catch (err) {
        console.error("Error updating blog:", err);
        res.status(500).json({
            success: false,
            message: "Failed to update blog",
            error: err.message,
        });
    }
};

// @desc    Delete blog
export const deleteBlog = async (req, res) => {
    try {
        const blogId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID format"
            });
        }

        const deletedBlog = await BlogModel.findByIdAndDelete(blogId);

        if (!deletedBlog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Blog deleted successfully",
            data: {
                deletedBlog
            }
        });
    } catch (err) {
        console.error("Error deleting blog:", err);
        res.status(500).json({
            success: false,
            message: "Failed to delete blog",
            error: err.message,
        });
    }
};

// Add Comment to Blog
export const addComment = async (req, res) => {
    const { comment } = req.body;

    if(!comment || comment.trim() === "") {
        return res.status(400).json({ 
            success: false, 
            message: "Comment cannot be empty" 
        });
    }

    try {
        const blog = await BlogModel.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        // console.log("User in blogController:", req.user);


        const newComment = {
            user: req.user.id,
            comment,
        };

        blog.comments.push(newComment);
        await blog.save();

        return res.status(201).json({ 
            success: true, 
            message: "Comment added successfully",
            data: {
                comment: newComment,
                blog
            }
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};
