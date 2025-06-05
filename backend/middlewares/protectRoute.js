import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

export const protectRout = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: you need to log in first" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(401).json({ message: "invalid token" });
    }
    const user = await UserModel.findById(decodedToken.userId).select(
      "-password"
    );
    if (!user) {
      return res.status(401).json({ message: "user not found!!" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(
      "Error checking authorized user in protectroute: ",
      error.message
    );
    res.status(500).json({ message: "internal server error" });
  }
};
