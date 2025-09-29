const { GoogleGenAI } = require('@google/genai');
const express = require('express');
const router = express.Router();
const verifyToken = require("../middleware/verify-token.js");
const Recipe = require("../models/recipe.js");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//Add a new recipe to database
router.post("/", verifyToken, async (req, res) => {    
    //console.log("req.body = ",req.body);
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
    //console.log("responseText = ",responseText);        
    const newRecipe = await Recipe.create(responseText);
    //console.log("newRecipe = ",newRecipe);        
    //const text='Added recipe';
    res.json({ generatedText: responseText });    
    res.status(201).json(text);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
   try {
    const allrecipes = await Recipe.find({})
      .populate("author")
      .sort({ createdAt: "desc" });
    res.status(200).json(allrecipes);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});



module.exports = router;