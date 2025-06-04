import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Database connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.log("Failure connecting database: ", error.message);
    process.exit(1); // exit 1 means with failure
  }
};
