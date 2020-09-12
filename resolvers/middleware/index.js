const { skip } = require('graphql-resolvers');
const Recipe = require('../../database/models/recipe')
const Category = require('../../database/models/category')
const { isValidObjectId } = require('../../database/util')

module.exports.isAuthenticated = (_, __, { email }) => {
    if (!email) {
        throw new Error('Access Denied')
    }
    return skip
}

module.exports.isRecipeOwner = async(_, { id }, { loggedInUserId }) => {
    try {
        if (!isValidObjectId(id)) {
            throw new Error('Invalid Recipe Id')
        }
        const recipe = await Recipe.findById(id)
        if (!recipe) {
            throw new Error('Recipe not Found')
        } else if (recipe.user.toString() !== loggedInUserId) {
            throw new Error('Not Authorized as Recipe Owner')
        }
        return skip
    } catch (error) {
        console.log(error)
        throw error
    }
}

module.exports.isCategoryOwner = async(_, { id }, { loggedInUserId }) => {
    try {
        if (!isValidObjectId(id)) {
            throw new Error('Invalid Category Id')
        }
        const category = await Category.findById(id)
        if (!category) {
            throw new Error('Category not found')
        } else if (category.user.toString() !== loggedInUserId) {
            throw new Error('Not Authorized as Category Owner')
        }
        return skip
    } catch (error) {
        console.log(error)
        throw error
    }
}