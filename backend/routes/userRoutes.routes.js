import express from "express";
import { protectRout } from "../middlewares/protectRoute.js";
import {
  getUserProfile,
  followUnfollowUser,
  getSuggestedUsers,
  updateProfile,
} from "../controllers/userControllers.controller.js";

const router = express.Router();

router.get("/profile/:username", protectRout, getUserProfile);
router.get("/suggested", protectRout, getSuggestedUsers);
router.post("/follow/:id", protectRout, followUnfollowUser);
router.post("/update", protectRout, updateProfile);

export default router; //imported as userRoutes
