import express from 'express';
import { loginUser, refreshAccessToken, registerNewUser, getMyProfile, getAllUsers, deleteUser, editProfile  } from '../controllers/userController.js';
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { canAccessUser } from "../middlewares/attributeBaseAccessControl.js";
import upload from '../middlewares/multer.js';



const router = express.Router();


router.post('/register',upload.single("profileImage"), registerNewUser)
router.post('/login', loginUser)
// router.put('/request-reset', requestPasswordReset);
// router.post('/reset-password/:token', resetPassword);
router.post('/refresh-token', refreshAccessToken)

router.get('/me', isAuthenticated, getMyProfile);
router.get("/", isAuthenticated, authorizeRoles("admin"), getAllUsers);
router.delete("/:id", isAuthenticated, authorizeRoles("admin"), deleteUser);

router.put("/:id", isAuthenticated, canAccessUser, editProfile);


export default router;