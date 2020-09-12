const { combineResolvers } = require('graphql-resolvers')

const Recipe = require('../database/models/recipe')
const Category = require('../database/models/category')
const User = require('../database/models/user')
const allRecipes = require('../constants/index')
const { isAuthenticated, isRecipeOwner, isCategoryOwner } = require('./middleware')
const { stringToBase64, base64ToString } = require('../helper/index')

module.exports = {
    Query: {
        getRecipes: async() => {
            try {
                return allRecipes
            } catch (error) {
                console.log(error)
                throw error
            }
        },
        getMyRecipes: combineResolvers(isAuthenticated, async(_, { cursor, limit = 10 }, { loggedInUserId }) => {
            try {
                const query = { user: loggedInUserId }
                if (cursor) {
                    query['_id'] = {
                        '$lt': base64ToString(cursor)
                    }
                }
                let recipes = await Recipe.find(query).sort({ _id: -1 }).limit(limit + 1)
                const recipeHasNextPage = recipes.length > limit
                recipes = recipeHasNextPage ? recipes.slice(0, -1) : recipes
                return {
                    recipeFeed: recipes,
                    recipePageInfo: {
                        recipeNextPageCursor: recipeHasNextPage ? stringToBase64(recipes[recipes.length - 1].id) : null,
                        recipeHasNextPage
                    }
                }
            } catch (error) {
                console.log(error)
                throw error
            }
        }),
        getOneRecipe: combineResolvers(isAuthenticated, isRecipeOwner, async(_, { id }) => {
            try {
                const recipe = await Recipe.findById(id)
                return recipe
            } catch (error) {
                console.log(error)
                throw error
            }
        }),
        getCategories: combineResolvers(isAuthenticated, async(_, { cursor, limit = 10 }, { loggedInUserId }) => {
            try {
                const query = { user: loggedInUserId }
                if (cursor) {
                    query['_id'] = {
                        '$lt': base64ToString(cursor)
                    }
                }
                let categories = await Category.find(query).sort({ _id: -1 }).limit(limit + 1)
                const categoryHasNextPage = categories.length > limit
                categories = categoryHasNextPage ? categories.slice(0, -1) : categories
                return {
                    categoryFeed: categories,
                    categoryPageInfo: {
                        categoryNextPageCursor: categoryHasNextPage ? stringToBase64(categories[categories.length - 1].id) : null,
                        categoryHasNextPage
                    }
                }
            } catch (error) {
                console.log(error)
                throw error
            }
        }),
        getOneCategory: combineResolvers(isAuthenticated, isCategoryOwner, async(_, { id }) => {
            try {
                const category = await Category.findById(id)
                return category
            } catch (error) {
                console.log(error)
                throw error
            }
        })
    },
    Mutation: {
        createRecipe: combineResolvers(isAuthenticated, async(_, { input }, { email }) => {
            try {
                const user = await User.findOne({ email })
                const recipe = new Recipe({...input, user: user.id })
                const result = await recipe.save()
                user.recipes.push(result.id)
                await user.save()
                return result
            } catch (error) {
                console.log(error)
                throw error
            }
        }),
        updateRecipe: combineResolvers(isAuthenticated, isRecipeOwner, async(_, { id, input }) => {
            try {
                const recipe = await Recipe.findByIdAndUpdate(id, {...input }, { new: true })
                return recipe
            } catch (error) {
                console.log(error)
                throw error
            }
        }),
        deleteRecipe: combineResolvers(isAuthenticated, isRecipeOwner, async(_, { id }, { loggedInUserId }) => {
            try {
                const recipe = await Recipe.findByIdAndDelete(id)
                await User.updateOne({ _id: loggedInUserId }, { $pull: { recipe: recipe.id } })
                return recipe
            } catch (error) {
                console.log(error)
                throw error
            }
        }),
        createCategory: combineResolvers(isAuthenticated, async(_, { input }, { email }) => {
            try {
                const user = await User.findOne({ email })
                const category = new Category({...input, user: user.id })
                const result = await category.save()
                user.recipes.push(result.id)
                await user.save()
                return result
            } catch (error) {
                console.log(error)
                throw error
            }
        }),
        updateCategory: combineResolvers(isAuthenticated, isCategoryOwner, async(_, { id, input }) => {
            try {
                const category = await Category.findByIdAndUpdate(id, {...input }, { new: true })
                return category
            } catch (error) {
                console.log(error)
                throw error
            }
        }),
        deleteCategory: combineResolvers(isAuthenticated, isCategoryOwner, async(_, { id }, { loggedInUserId }) => {
            try {
                const category = await Category.findByIdAndDelete(id)
                await User.updateOne({ _id: loggedInUserId }, { $pull: { category: category.id } })
                return category
            } catch (error) {
                console.log(error)
                throw error
            }
        })
    },
    Recipe: {
        user: async(parent, _, { loaders }) => {
            try {
                // const user = await User.findById(parent.user)
                const user = await loaders.user.load(parent.user.toString())
                return user
            } catch (error) {
                console.log(error)
                throw error
            }
        }
    }
}