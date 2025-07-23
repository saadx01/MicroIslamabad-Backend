import UserModel from "../models/userModel.js";
import { generateAccessTokens, generateRefreshTokens } from "../utils/generateTokens.js";
import { AppError } from '../utils/AppError.js';
import sharp from "sharp";
import fs from "fs";


export const registerNewUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        console.log("rew",req.body);


        if (!name || !email || !password) {
            return next(new AppError("All fields are required", 400));
        }
        // if (!req.file) {
        //     return next(new AppError("Profile image is required", 400));
        // }

        // console.log("Registration attempt with data:", req.file)
        // const image = sharp(req.file.path);
        // // Get dimensions
        // const metadata = await image.metadata();
        // console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);

        // // Resize image
        // const resizedPath = `uploads/resized-${req.file.filename}`;
        // await sharp(req.file.path)
        //     .resize(300, 300)
        //     .toFile(resizedPath);

        // // fs?.unlinkSync(req.file.path); // Delete original
        // //fs is not deleting the file use other method
        // try {
        //     fs.unlinkSync(req.file.path);
        // } catch (err) {
        //     console.warn("Could not delete original image:", err.message);
        // }



        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            // return res.status(400).json({
            //     success: false,
            //     message: "User already exists"
            // });
            return next(new AppError("User already exists", 400));
        }

        // Create new user
        const newUser = new UserModel({
            name,
            email,
            password,
            role: role || "user", // Default role is 'user'
            // profileImage: resizedPath // Save resized image path
        });

        // Save user to database
        await newUser.save();

        const accessToken = generateAccessTokens(newUser);
        const refreshToken = generateRefreshTokens(newUser);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                // profileImage: newUser.profileImage,
                accessToken,
                refreshToken
            },
        });

    }
    catch (err) {
        console.error("error",err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("Login attempt with email:", email);
        console.log("Login attempt with password:", password);

        // Check if user exists
        const user = await UserModel.findOne({ email });

        console.log("User found:", user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const accessToken = generateAccessTokens(user);
        const refreshToken = generateRefreshTokens(user);

        console.log("Access Token:", accessToken);
        console.log("Refresh Token:", refreshToken);

        // Save user ID & role in session
        // const {id,email} = req.session.user
        // req.session.user = {
        //     id: user._id,
        //     email: user.email,
        //     role: user.role,
        // };

        res.status(200).json({
            success: true,
            message: "Login successful",
            user,
            accessToken,
            refreshToken
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err
        });
        // if (err.name === 'ValidationError') {
        //     return res.status(400).json({
        //         success: false,
        //         message: err.message || 'Validation failed',
        //         error: err.errors,
        //     });
        // }
        // res.status(500).json({ 
        //     success: false, 
        //     message: 'Registration failed', 
        //     error: err.message 
        // });

    }
};


export const refreshAccessToken = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken)
        return res.status(401).json({
            message: "Refresh token required"
        });

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const newAccessToken = generateAccessToken(decoded);
        res.status(200).json({
            success: true,
            accessToken: newAccessToken
        });
    } catch (err) {
        res.status(403).json({
            success: false,
            message: "Invalid or expired refresh token"
        });
    }
};


export const getMyProfile = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id).select("-password");
        res.status(200).json({
            success: true,
            data: {
                user: user
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: err.message
        });
    }
};


// Get all users (admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find().select("-password"); // Don't expose passwords

        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                users: users
            }
        });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
        });
    }
};

// Delete a user by ID (admin only)
export const deleteUser = async (req, res) => {
    try {
        const user = await UserModel.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: {
                deltedUser: user
            }
        });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({
            success: false,
            message: "Failed to delete user",
        });
    }
};


// Edit profile (only owner)
export const editProfile = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const updatedFields = {};
        if (name) updatedFields.name = name;
        if (email) updatedFields.email = email;
        if (password) updatedFields.password = password;

        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        Object.assign(user, updatedFields);

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ success: false, message: "Failed to update profile" });
    }
};
