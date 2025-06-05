import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); //parse form data
app.use(cookieParser());

//routes start here
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log(`server started on port: ${PORT}`);
});
