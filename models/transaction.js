var mongoose = require('mongoose')
var productSchema = require('./product.js')
var outletSchema = require('./outlet.js')

// create the Policy Schema
var transactionSchema = new mongoose.Schema({
  tdate: {
    type: String,
    default: new Date()
  },

  tqty: {
    type: String
  },

  products:
  {
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  },

  outlets: {
    type: mongoose.Schema.ObjectId,
    ref: 'Outlet'
  }

})

var Transaction = mongoose.model('Transaction', transactionSchema)

module.exports = Transaction
