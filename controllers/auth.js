const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User with this email doesn't exist!");
      error.statusCode = 422;
      throw error;
    }
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      const error = new Error("Incorrect Password!");
      error.statusCode = 422;
      throw error;
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    res
      .status(200)
      .json({
        message: "Logged In Successfully!",
        userId: user._id.toString(),
        token: token,
        expiresIn: 3600,
      });
  } catch (error) {
    next(error);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne({ email: email });
    // Check if user with the email is already exist.
    if (user) {
      const error = new Error("Email already exist!");
      error.statusCode = 422;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const signedUpUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
    });
    const result = await signedUpUser.save();

    const token = jwt.sign(
      { userId: result._id.toString(), email: email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.status(201).json({
      message: "Signed Up Successfully!",
      userId: result._id.toString(),
      token: token,
      expiresIn: 3600,
    });
  } catch (error) {
    next(error);
  }
};
