const { GraphQLDateTime } = require('graphql-iso-date')
const userResolver = require('./user')
const recipeResolver = require('./recipe')
const categoryResolver = require('./category')

const customDateScalarResolver = {
    Date: GraphQLDateTime
}

module.exports = [
    userResolver,
    recipeResolver,
    categoryResolver,
    customDateScalarResolver
]