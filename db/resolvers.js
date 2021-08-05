const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config({
  path: '.env'
});

const UserModel = require('../models/User');
const OrderModel = require('../models/Order');
const ClientModel = require('../models/Client');
const ProductModel = require('../models/Product');

const createToken = (user, secret, expiresIn) => {
  const { id } = user;

  return jwt.sign({ id }, secret, { expiresIn })
}

const resolvers = {
  Query: {
    getUser: async (_, { token }, ctx) => {
      const userId = await jwt.verify(token, process.env.SECRET_WORD);

      return userId;
    },
    getProduct: async (_, { id }, ctx) => {
      const product = await ProductModel.findById(id);

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    },
    getProducts: async () => {
      try {
        const products = await ProductModel.find({});

        return products;
      } catch (error) {
        console.log('get products error: ', error);
      }
    },
    getClient: async (_, { id }, ctx) => {
      try {
        const client = await ClientModel.findById(id);

        if (!client) {
          throw new Error('Client not found');
        }

        if (client.vendor.toString() !== ctx.user.id) {
          throw new Error('User not authorized to see client');
        }

        return client;
      } catch (error) {
        console.log('get client error: ', error);
      }
    },
    getClients: async () => {
      try {
        const clients = await ClientModel.find({});
        return clients;
      } catch (error) {
        console.log('get clients error: ', error);
      }
    },
    getClientsVendor: async (_, {}, ctx) => {
      try {
        const clients = await ClientModel.find({ vendor: ctx.user.id });
        return clients;
      } catch (error) {
       console.log('get clients vendor: ', error); 
      }
    },
    getOrder: async (_, { id }, ctx) => {
      const order = await OrderModel.findById(id);

      if (!order) {
        throw new Error('Order does not exists');
      }

      if (order.vendor.toString() !== ctx.user.id) {
        throw new Error('User not authorized to get order');
      }

      return order;
    },
    getOrders: async () => {
      try {
        const orders = await OrderModel.find({});
        return orders;
      } catch (error) {
        console.log('get orders error: ', error);
      }
    },
    getOrdersVendor: async (_, {}, ctx) => {
      try {
        const orders = await OrderModel.find({ vendor: ctx.user.id });
        return orders;
      } catch (error) {
        console.log('get orders vendor error: ', error);
      }
    },
  },
  Mutation: {
    createUser: async (_, { input }, ctx) => {
      const { email, password } = input;

      const userExists = await UserModel.findOne({ email });
      
      if (userExists) {
        throw new Error('User already exists');
      }
      
      try {
        const salt = await bcryptjs.genSalt(10);
        input.password = await bcryptjs.hash(password, salt);

        const user = new UserModel(input);
        user.save();

        return user;
      } catch (error) {
        console.log('createUser error: ', error);
      }
    },
    authenticateUser: async (_, { input }, ctx) => {
      const { email, password } = input;

      const userExists = await UserModel.findOne({ email });

      if (!userExists) {
        throw new Error('User does not exists');
      }

      const passwordMatch = await bcryptjs.compare(password, userExists.password);

      if (!passwordMatch) {
        throw new Error('Invalid password');
      }

      return {
        token: createToken(userExists, process.env.SECRET_WORD, '24h')
      }
    },
    createProduct: async (_, { input }, ctx) => {
      try {
        const product = new ProductModel(input);
        const result = await product.save();

        return result;
      } catch (error) {
        console.log('create product error: ', error);
      }
    },
    updateProduct: async (_, { id, input }, ctx) => {
      let product = await ProductModel.findById(id);

      if (!product) {
        throw new Error('Product not found');
      }

      product = await ProductModel.findOneAndUpdate(
        { _id: id },
        input,
        { new: true }
      );

      return product;
    },
    deleteProduct: async (_, { id }, ctx) => {
      let product = await ProductModel.findById(id);

      if (!product) {
        throw new Error('Product not found');
      }

      await ProductModel.findOneAndDelete({ _id: id });

      return "Product deleted"
    },
    createClient: async (_, { input }, ctx) => {
      console.log('ctx: ', ctx);
      const { email } = input;

      let client = await ClientModel.findOne({ email });

      if (client) {
        throw new Error('Client already registered');
      }

      client = new ClientModel(input);
      client.vendor = ctx.user.id;

      try {
        const result = await client.save();

        return result;
      } catch (error) {
        console.log('create client error: ', error);
      }
    },
    updateClient: async (_, { id, input }, ctx) => {
      let client = await ClientModel.findById(id);

      if (!client) {
        throw new Error('Client does not exists');
      }

      if (client.vendor.toString() !== ctx.user.id) {
        throw new Error('User is not authorized to update client');
      }

      client = await ClientModel.findOneAndUpdate(
        { _id: id },
        input,
        { new: true }
      );
      
      return client;
    },
    deleteClient: async (_, { id }, ctx) => {
      const client = await ClientModel.findById(id);

      if (!client) {
        throw new Error('Client does not exists');
      }

      if (client.vendor.toString() !== ctx.user.id) {
        throw new Error('Client not authorised to delete');
      }

      await ClientModel.findByIdAndDelete({ _id: id });

      return 'Client deleted'
    },
    createOrder: async (_, { input }, ctx) => {
      const { client: clientId } = input;

      const client = await ClientModel.findById(clientId);

      if (!client) {
        throw new Error('Client does not exists');
      }

      // Verify if client belongs to vendor
      if (client.vendor.toString() !== ctx.user.id) {
        throw new Error('User not authorized to create order for client');
      }

      // Check stock available
      for await (const article of input.details) {
        const { id } = article;
        const product = await ProductModel.findById(id);

        if (article.quantity > product.stock) {
          throw new Error(`${product.name} exceeds available stock`);
        } else {
          product.stock -= article.quantity;
          await product.save();
        }
      }

      const order = new OrderModel(input);
      order.vendor = ctx.user.id;

      const result = await order.save();
      return result;
    }
  }
}

module.exports = resolvers;
