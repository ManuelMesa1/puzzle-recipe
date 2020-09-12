const { combineResolvers } = require('graphql-resolvers')

const Recipe = require('../database/models/recipe')
const Category = require('../database/models/category')
const User = require('../database/models/user')

const { isAuthenticated, isCategoryOwner } = require('./middleware')
const { stringToBase64, base64ToString } = require('../helper/index')

module.exports = {
    Query: {
        getCategories: combineResolvers(isAuthenticated, async(_, { cursor, limit = 10 }, { loggedInUserId }) => {
            try {
                const query = { user: loggedInUserId }
                if (cursor) {
                    query['_id'] = {
                        '$lt': base64ToString(cursor)
                    }
                }
                let categories = await Category.find(query).sort({ _id: -1 }).limit(limit + 1)
                const categoryHasNextPage = category.length > limit
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
    Category: {
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