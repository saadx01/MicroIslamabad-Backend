import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized access" });
    }
    console.log("Token received:", token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        req.user = decoded;
        // console.log("User authenticated in authMiddlware:", req.user);
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}