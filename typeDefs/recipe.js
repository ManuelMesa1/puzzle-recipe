const { gql } = require('apollo-server-express')

module.exports = gql `
extend type Query{
    getMyRecipes(cursor: String, limit: Int): RecipeFeed!
    getOneRecipe(id: ID!): Recipe
    getRecipes: [Recipe!]
}

type RecipeFeed{
    recipeFeed: [Recipe!]
    recipePageInfo: RecipePageInfo!
}

type RecipePageInfo{
    recipeNextPageCursor: String
    recipeHasNextPage: Boolean
}

input createRecipeInput{
    name: String!
    ingredients: String!
    category: String!
}

extend type Mutation{
    createRecipe(input: createRecipeInput!): Recipe
    updateRecipe(id: ID!, input: updateRecipeInput!): Recipe
    deleteRecipe(id: ID!): Recipe
}

input updateRecipeInput{
    name: String!
    ingredients: String!
}

type Recipe{
    id: ID!
    name: String!
    description: String!
    ingredients: String!
    category: [Category!]
    user: String!
    createdAt: Date!
    updatedAt: Date!
}

`