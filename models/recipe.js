const mongoose = require('mongoose');

const commentsSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);
const recipeSchema = new mongoose.Schema(
 {
    recipeName: {
      type: String,
      required: true,
    },
    mealType: {
      type: String,
    },
    dietaryPreference: {
      type: String,      
    },
    description: {
      type: String,      
    },
    prepTime: {
      type: String,     
    },
    cookTime: {
      type: String,      
    },
    servings: {
      type: String,      
    },
    ingredients: {
      type: [Object],         
    },
    instructions: {
      type: [Object],      
    },
    chefNotes:{
      type:String,
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    image: {type : String},
    comments: [commentsSchema], 
   },
   { timestamps: true }
);

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;