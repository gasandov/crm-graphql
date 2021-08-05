const mongoose = require('mongoose');

require('dotenv').config({
  path: '.env'
});

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });

    console.log('db connected');
  } catch (error) {
    console.log('db connection error: ', error);
    process.exit(1);
  }
}

module.exports = dbConnection;