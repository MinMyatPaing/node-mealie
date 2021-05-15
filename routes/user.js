const express = require("express");

const router = express.Router();

const userController = require('../controllers/user');
const authCheck = require("../middlewares/authCheck");

router.get('/userData', authCheck, userController.getUserData);

router.post("/send-mail", authCheck, userController.sendUserMail);

router.put("/userData", authCheck, userController.updateUserData);

module.exports = router;
