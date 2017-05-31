var mongoose = require('mongoose')
var outletSchema = require('./outlet.js')

// create the Product Schema
var productSchema = new mongoose.Schema({
  productname: {
    type: String,
    required: true
  },

  qty: {
    type: Number,
    required: true
  },

  productdesc: {
    type: String
  },

  sku: {
    type: String
  },
  outlets: {
    type: mongoose.Schema.ObjectId,
    ref: 'outlets'
  }

})

var Product = mongoose.model('Product', productSchema)

module.exports = Product
