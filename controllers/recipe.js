const throwErr = require("../utils/throwErr");
const clearImg = require("../utils/clearImg");

const User = require("../models/user");
const Recipe = require("../models/recipe");

const ITEMS_PER_PAGE = 6;

exports.getRecipes = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const totalItems = await Recipe.find().countDocuments();
    const recipes = await Recipe.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .sort({ updatedAt: -1 });
    res.status(200).json({
      message: "Recipes Fetched Successfully!",
      recipes: recipes,
      page: page,
      totalItems: totalItems,
      itemsPerPage: ITEMS_PER_PAGE,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserRecipes = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const page = +req.query.page || 1;
    if (!userId) {
      throwErr(422, "UserId is missing!");
    }

    const totalItems = await Recipe.find({ creator: userId }).countDocuments();
    const recipes = await Recipe.find({ creator: userId })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .sort({ updatedAt: -1 });

    res.status(200).json({
      message: "User Recipes fetched successfully!",
      recipes: recipes,
      totalItems: totalItems,
      page: page,
      itemsPerPage: ITEMS_PER_PAGE,
    });
  } catch (error) {
    next(error);
  }
};

exports.postRecipe = async (req, res, next) => {
  try {
    const { title, description, info, ingredients, steps } = req.body;
    if (!req.file) {
      throwErr(422, "Image was not picked!");
    }
    //console.trace(req.file);
    const imageUrl = req.file.path.replace(/\\/g, "/");

    const recipe = new Recipe({
      title: title,
      description: description,
      imageUrl: imageUrl,
      info: info,
      ingredients: ingredients,
      steps: steps,
      creator: req.userId,
    });
    const recipeResult = await recipe.save();
    const user = await User.findById(req.userId);
    if (!user) {
      throwErr(404, "User not found!");
    }
    user.recipes.push(recipeResult._id);
    await user.save();

    res.status(201).json({
      message: "Recipe created successfully!",
      recipe: recipeResult,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRecipe = async (req, res, next) => {
  try {
    const recipeId = req.params.recipeId;
    const { title, description, info, ingredients, steps } = req.body;
    if (!req.file) {
      throwErr(422, "Image was not picked");
    }
    const imageUrl = req.file.path.replace(/\\/g, "/");
    const recipe = await Recipe.findById(recipeId);
    recipe.title = title;
    if (recipe.imageUrl !== imageUrl) {
      clearImg(recipe.imageUrl);
      recipe.imageUrl = imageUrl;
    }
    recipe.description = description;
    recipe.info = info;
    recipe.ingredients = ingredients;
    recipe.steps = steps;

    const recipeResult = await recipe.save();
    const user = await User.findById(req.userId);
    const recipeIndex = user.recipes.findIndex((recipe) => recipe === recipeId);
    user.recipes[recipeIndex] = recipeResult._id;
    await user.save();

    res.status(200).json({
      message: "Updated recipe successfully!",
      recipe: recipeResult,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteRecipe = async (req, res, next) => {
  try {
    const recipeId = req.params.recipeId;
    // console.log("RecipeId ===> ", {recipeId});
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      throwErr(404, "Recipe cannot be found!");
    }
    clearImg(recipe.imageUrl);
    const result = await Recipe.findByIdAndDelete(recipeId);

    const user = await User.findById(req.userId);
    user.recipes = user.recipes.filter((recipe) => recipe._id !== recipeId);
    await user.save();
    res.status(200).json({
      message: "Recipe deleted Successfully!",
      recipeId: result._id,
    });
  } catch (error) {
    next(error);
  }
};
