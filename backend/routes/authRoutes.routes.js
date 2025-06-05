import express from "express";
import {
  signUp,
  logIn,
  logOut,
  getMe,
} from "../controllers/authController.controller.js";
import { protectRout } from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/me", protectRout, getMe);

router.post("/signup", signUp);

router.post("/login", logIn);

router.post("/logout", logOut);

export default router; //imported as authRoutes
