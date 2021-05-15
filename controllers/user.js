const nodemailer = require("nodemailer");

const User = require("../models/user");
const throwErr = require("../utils/throwErr");
const clearImg = require("../utils/clearImg");

var transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "77838e4683f260",
    pass: "e81106ca55bc89",
  },
});

exports.getUserData = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      throwErr(404, "User not found!");
    }
    //console.log(user);

    res.status(200).json({
      message: "Fetched Data Successfully!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        socialMedia: user.socialMedia,
        imageUrl: user.imageUrl,
        recipes: user.recipes,
        biography: user.biography,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserData = async (req, res, next) => {
  try {
    const { username, biography, facebook, instagram } = req.body;
    //console.log(req.body);
    if (!req.file) {
      throwErr(422, "Image is not picked!");
    }
    // console.log("Image == >   ", req.file);
    const imageUrl = req.file.path.replace(/\\|%/g, "/");
    // console.log(imageUrl);
    const user = await User.findById(req.userId);

    user.username = username;
    user.biography = biography;
    user.socialMedia = {
      facebook: facebook ? facebook : "",
      instagram: instagram ? instagram : "",
    };
    if (imageUrl !== user.imageUrl) {
      if (user.imageUrl) {
        clearImg(user.imageUrl);
      }
      user.imageUrl = imageUrl;
    }
    const result = await user.save();

    res.status(200).json({
      message: "User Data Updated Successfully!",
      user: {
        id: result._id,
        username: result.username,
        email: result.email,
        imageUrl: result.imageUrl,
        recipes: result.recipes,
        biography: result.biography,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.sendUserMail = async (req, res, next) => {
  try {
    const { username, email, subject, message } = req.body;
    const user = await User.find({ email: email });
    if (!user) {
      throwErr(404, "User with this email doesn't exist!");
    }

    let mailOptions = {
      from: `${username} <${email}>`,
      to: "minmyatpaing64@gmail.com",
      subject: subject,
      text: message,
    };

    transport.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        res.status(500).json({
          message:
            "Your mail was unable to send for now. Sorry for your inconvinience.",
        });
      } else {
        res.status(200).json({ message: "Mail received!" });
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
