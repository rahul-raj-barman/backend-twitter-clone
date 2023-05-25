const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    userName: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    profilePic: {
      type: String,
      required: false,
    },

    location: {
      type: String,
      required: false,
    },

    dob: {
      type: Date,
      required: false,
    },

    followers: {
      type: Array,
      ref: "UserModel",
    },

    followings: {
      type: Array,
      ref: "UserModel",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserModel", userSchema);
