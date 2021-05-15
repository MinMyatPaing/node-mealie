const jwt = require("jsonwebtoken");

const throwErr = require("../utils/throwErr");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      throwErr(401, "You are not authenticated!");
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decodedToken) {
      throwErr(401, "You are not authenticated!");
    }
    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    next(error);
  }
};
