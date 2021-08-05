const { gql } = require('apollo-server');

const typeDefs = gql`
  type User {
    id: ID
    firstName: String
    lastName: String
    email: String
    createdAt: String
  }

  input UserInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
  }

  type Token {
    token: String
  }

  input AuthInput {
    email: String!
    password: String!
  }

  type Product {
    id: ID
    name: String
    stock: Int
    price: Float
    createdAt: String
  }

  input ProductInput {
    name: String!
    stock: Int!
    price: Float!
  }

  type Client {
    id: ID
    firstName: String
    lastName: String
    company: String
    email: String
    phone: String
    vendor: ID
    createdAt: String
  }

  input ClientInput {
    firstName: String!
    lastName: String!
    company: String!
    email: String!
    phone: String
  }

  type Order {
    id: ID
    details: [OrderDetails]
    total: Float
    status: OrderStatus
    client: ID
    vendor: ID
    createdAt: String
  }

  type OrderDetails {
    id: ID
    quantity: Int
  }

  input OrderProductInput {
    id: ID
    quantity: Int
  }

  input OrderInput {
    details: [OrderProductInput]
    total: Float!
    client: ID!
    status: OrderStatus!
  }

  enum OrderStatus {
    PENDING
    CANCELED
    COMPLETED
  }

  type Query {
    # User
    getUser(token: String!): User

    # Product
    getProduct(id: ID!): Product
    getProducts: [Product]

    # Client
    getClient(id: ID!): Client
    getClients: [Client]
    getClientsVendor: [Client]

    # Order
    getOrder(id: ID!): Order
    getOrders: [Order]
    getOrdersVendor: [Order]
  }

  type Mutation {
    # User
    createUser(input: UserInput): User
    authenticateUser(input: AuthInput): Token

    # Product
    createProduct(input: ProductInput): Product
    updateProduct(id: ID!, input: ProductInput): Product
    deleteProduct(id: ID!): String

    # Client
    createClient(input: ClientInput): Client
    updateClient(id: ID!, input: ClientInput): Client
    deleteClient(id: ID!): String

    # Order
    createOrder(input: OrderInput): Order
  }
`;

module.exports = typeDefs;
