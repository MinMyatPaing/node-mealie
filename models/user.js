const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  socialMedia: {
    type: {
      facebook: {
        type: String,
        default: "https://www.facebook.com/",
      },
      instagram: {
        type: String,
        default: "https://www.instagram.com/",
      },
    },
  },
  recipes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
    },
  ],
  imageUrl: {
    type: String,
  },
  biography: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("User", userSchema);
