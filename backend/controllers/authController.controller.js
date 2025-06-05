import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUsername = await UserModel.findOne({ username: username });
    if (existingUsername) {
      return res.status(400).json({ error: "username already exists" });
    }

    const existingEmail = await UserModel.findOne({ email: email });

    if (existingEmail) {
      return res.status(400).json({ error: "email already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be at least 6 characters long" });
    }

    //hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //creating new user
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
      fullName,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        message: "user created successfully!",
        data: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          fullName: newUser.fullName,
          followers: newUser.followers,
          following: newUser.following,
          profileImage: newUser.profileImage,
          coverImage: newUser.coverImage,
        },
      });
    } else {
      return res.status(400).json({ message: "Errow with data!!" });
    }
  } catch (error) {
    console.log("Error creating user: ", error.message);
    res.status(400).json({ message: "Error creating user!!" });
  }
};

export const logIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    const userFound = await UserModel.findOne({ username: username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      userFound?.password || ""
    );

    if (!userFound || !isPasswordCorrect) {
      return res
        .status(404)
        .json({ messsage: "incorrect username or password!" });
    }
    generateTokenAndSetCookie(userFound._id, res);
    res.status(200).json({
      message: "successfully logged in",
      data: {
        _id: userFound._id,
        username: userFound.username,
        email: userFound.email,
        fullName: userFound.fullName,
        profileImage: userFound.profileImage,
        coverImage: userFound.coverImage,
        followers: userFound.followers,
        following: userFound.following,
      },
    });
  } catch (error) {
    console.log("Error loging in: ", error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

export const logOut = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "logged out successfully" });
  } catch (error) {
    console.log("Error loging out: ", error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).select("-password");
    res.status(200).json({ data: user });
  } catch (error) {
    console.log("Error getting authenticated user: ", error.message);
    res.status(500).json({ message: "internal server error!!" });
  }
};
