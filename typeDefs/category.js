const { gql } = require('apollo-server-express')

module.exports = gql `
extend type Query{
categories(cursor: String, limit: Int): CategoryFeed!
category(id: ID!): Category
}

type CategoryFeed{
    CategoryFeed: [Category!]
    categoryPageInfo: CategoryPageInfo!
}

type CategoryPageInfo{
    categoryNextPageCursor: String
    categoryHasNextPage: Boolean
}

input createCategoryInput{
    name: String
}

extend type Mutation {
    createCategory(input: createCategoryInput): Category
    updateCategory(id: ID!, input: updateCategoryInput!): Category
    deleteCategory(id: ID): Category
}

input updateCategoryInput{
    name: String!
}

type Category{
    id: ID!
    name: String!
}
`