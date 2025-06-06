import NotificationModel from "../models/notificationModel.js";
import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await UserModel.findByOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    res.status(200).json({ message: "user found", data: user });
  } catch (error) {
    console.log("error getting profile: ", error.message);
    res.status(500).json({ error: "internal server error" });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToFollow = await UserModel.findById(id);
    const currentUser = await UserModel.findById(req.user._id);
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "cannot follow or unfollow yourself" });
    }
    if (!userToFollow || !currentUser) {
      return res.status(404).json({ error: "user not found" });
    }
    // console.log(currentUser);

    const isfollowing = currentUser.following.includes(userToFollow._id); //current user is following the person
    if (isfollowing) {
      //unfollow the user
      await UserModel.findByIdAndUpdate(req.user._id, {
        $pull: { following: id },
      });
      await UserModel.findByIdAndUpdate(userToFollow._id, {
        $pull: { followers: req.user._id },
      });
      res.status(200).json({ message: "successfully unfollowed the user" });
    } else {
      //follow the user
      await UserModel.findByIdAndUpdate(userToFollow._id, {
        $push: { followers: req.user._id },
      }); //update user being followed
      await UserModel.findByIdAndUpdate(req.user._id, {
        $push: { following: userToFollow._id },
      }); //update for current user
      //send notification to user being followed;
      const newNotification = new NotificationModel({
        type: "follow",
        from: req.user._id,
        to: userToFollow._id,
      });
      await newNotification.save(),
        //TODO return id of the user as a response
        res.status(200).json({ message: "user followed successfully" });
    }
  } catch (error) {
    console.log("Error following or unfollowing user: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentUser = await UserModel.findById(userId);
    const filteredUsers = await UserModel.aggregate([
      {
        $match: {
          _id: { $ne: currentUser._id },
        },
      },
      {
        $match: {
          following: { $nin: currentUser.following },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);
    // console.log(filteredUsers);
    filteredUsers.forEach((user) => (user.password = null));
    const suggestedUsers = filteredUsers.slice(0, 4);
    res
      .status(200)
      .json({ message: "suggested Users Found", data: suggestedUsers });
  } catch (error) {
    console.log("Error in server: ", error.message);
    res.status(500).json({ error: "internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  const {
    username,
    email,
    profileImage,
    coverImage,
    fullName,
    currentPassword,
    newPassword,
    bio,
    link,
  } = req.body;
  const userId = req.user._id;
  // console.log(req.body);
  try {
    const currentUser = await UserModel.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "user not found" });
    }
    if (
      (currentPassword && !newPassword) ||
      (newPassword && !currentPassword)
    ) {
      return res
        .status(400)
        .json({ error: "provide both current and new password fields" });
    }
    if (currentPassword && newPassword) {
      //check if old password in database and new password match
      const isMatch = bcrypt.compare(currentPassword, currentUser.password);
      if (!isMatch) {
        return res.status(400).json({ error: "incorrect old password" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      currentUser.password = bcrypt.hash(newPassword, salt);
    }
    if (coverImage) {
      if (currentUser.coverImage) {
        //if user already has cover image then destroy it in cloudinary first
        await cloudinary.uploader.destroy(
          currentUser.coverImage.split("/").pop().split(".")[0]
        );
      }
      //update cover image
      const uploadRes = cloudinary.uploader.upload(coverImage);
      const newCoverImage = uploadRes.secure_url;
      currentUser.coverImage = newCoverImage || currentUser.coverImage;
    }
    if (profileImage) {
      if (currentUser.profileImage) {
        //if user already has cover image then destroy it in cloudinary first
        await cloudinary.uploader.destroy(
          currentUser.coverImage.split("/").pop().split(".")[0]
        );
      }
      //update profile image
      const uploadRes = cloudinary.uploader.upload(profileImage);
      const newProfileImage = uploadRes.secure_url;
      currentUser.profileImage = newProfileImage || currentUser.profileImage;
    }
    //update other fields
    currentUser.username = username || currentUser.username;
    currentUser.email = email || currentUser.email;
    currentUser.fullName = fullName || currentUser.fullName;
    currentUser.bio = bio || currentUser.bio;
    currentUser.link = link || currentUser.link;
    await currentUser.save();
    currentUser.password = null;
    res
      .status(200)
      .json({ message: "profile updated successfully", data: currentUser });
  } catch (error) {
    console.log("Error updating user: ", error.message);
    res.status(500).json({ error: "error updating user" });
  }
};
