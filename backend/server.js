import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.routes.js";

dotenv.config();
const PORT = process.env.PORT || 8000;

const app = express();
app.use(express.json());

//routes start here
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log(`server started on port: ${PORT}`);
});
