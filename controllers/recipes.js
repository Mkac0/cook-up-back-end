const { GoogleGenAI } = require('@google/genai');
const express = require('express');
const router = express.Router();
const verifyToken = require("../middleware/verify-token.js");
const Recipe = require("../models/recipe.js");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//Add a new recipe to database
router.post("/", verifyToken, async (req, res) => {    
    console.log("req.body = ",req.body);
    try {          
    const prompt = `
    You are a world-class chef. Your task is to create a delicious and easy-to-follow recipe.
    
    Please use the following ingredients: ${req.body.contents}.
    
    The recipe should be for:
    - Meal Type:  ${req.body.meal_type === 'Any' ? 'any meal' : req.body.meal_type}
    - Dietary Preference: ${req.body.dietary_preference === 'None' ? 'no specific dietary restrictions' : req.body.dietary_preference}
    
    Generate a creative and appealing recipe. If some key ingredients are missing for a classic dish, feel free to suggest a creative alternative or a simpler version. The instructions should be clear for a home cook.
    
    Return the recipe in the specified JSON format.
  `;
    const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config:{
       responseMimeType: 'application/json',
        temperature: 0.8,
        topP: 0.95,
    },
  });    
    const responseText = JSON.parse(response.text);
    console.log("responseText = ",responseText);   
    responseText.author = req.user._id        
    const newRecipe = (await Recipe.create(responseText));
    console.log("newRecipe = ",newRecipe);        
    //const text='Added recipe';
    res.json({ generatedText: responseText });    
    res.status(201).json(text);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//Get all recipes
router.get("/", verifyToken, async (req, res) => {
  //console.log("req.user = ",req.user._id);
   try {
    const allrecipes = await Recipe.find({author: req.user._id})
      .populate("author")
      .sort({ createdAt: "desc" });
    res.status(200).json(allrecipes);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//Get /recipe/:recipeId
router.get("/:recipeId", verifyToken, async (req, res) => {
  try {
    // populate author of recipe and comments
    const recipe = await Recipe.findById(req.params.recipeId).populate("author").sort({ createdAt: "desc" });    
    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//Put :recipeId
router.put("/:recipeId", verifyToken, async (req, res) => {
  try {
    // Find the recipe:
    const recipe = await Recipe.findById(req.params.recipeId);

    // Check permissions:
    if (!recipe.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }

    // Update hoot:
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.recipeId,
      req.body,
      { new: true }
    );

    // Append req.user to the author property:
    updatedRecipe._doc.author = req.user;

    // Issue JSON response:
    res.status(200).json(updatedRecipe);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//Delete :recipeid
router.delete("/:recipeId", verifyToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);    

    if (!recipe.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.recipeId);    

    res.status(200).json(deletedRecipe);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


module.exports = router;