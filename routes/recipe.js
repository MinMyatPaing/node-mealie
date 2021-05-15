const express = require("express");

const authCheck = require("../middlewares/authCheck");
const recipeController = require("../controllers/recipe");

const router = express.Router();

router.get("/recipes", authCheck, recipeController.getRecipes);

router.get("/user/:userId", authCheck, recipeController.getUserRecipes);

router.post("/recipes", authCheck, recipeController.postRecipe);

router.put("/recipes/:recipeId", authCheck, recipeController.updateRecipe);

router.delete("/recipes/:recipeId", authCheck, recipeController.deleteRecipe);

module.exports = router;
