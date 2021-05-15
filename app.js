const fs = require("fs");
const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const compression = require("compression");
const morgan = require("morgan");
const helmet = require("helmet");

const app = express();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const recipeRoutes = require("./routes/recipe");

// CONSTANT VARIABLES
const MONGODB_URL =
  `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-shard-00-00.63q7m.mongodb.net:27017,cluster0-shard-00-01.63q7m.mongodb.net:27017,cluster0-shard-00-02.63q7m.mongodb.net:27017/${process.env.MONGO_DATABASE}?ssl=true&replicaSet=atlas-9o0w7b-shard-0&authSource=admin&retryWrites=true&w=majority`;
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType = req.query.fileType;
    if (fileType === "recipe") {
      cb(null, path.join("images", "recipe"));
    } else if (fileType === "user") {
      cb(null, path.join("images", "user"));
    } else {
      throw new Error("File type is not defined in query.");
    }
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/\-/g, "").replace(/\:/g, "") +
        file.originalname
    );
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  {
    flags: "a",
  }
);

// Header Setters and Third Party Middlewares
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(helmet());
app.use(express.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(
  "/images/recipe",
  express.static(path.join(__dirname, "images", "recipe"))
);
app.use("/images/user", express.static(path.join(__dirname, "images", "user")));

// Routes
app.use(authRoutes);
app.use("/user", userRoutes);
app.use("/recipe", recipeRoutes);

// Error Handling Middleware
app.use((error, req, res, next) => {
  // console.log("Error ===> ", error);
  const statusCode = error.statusCode || 500;
  if (statusCode === 500) {
    error.message = "Something went wrong on server!";
    //console.log(error);
  }
  res.status(statusCode).json({ message: error.message });
});

mongoose.connect(MONGODB_URL, (err) => {
  if (err) {
    return console.log(err);
  }
  app.listen(process.env.PORT || 8080);
});
