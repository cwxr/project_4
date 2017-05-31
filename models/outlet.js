var mongoose = require('mongoose')
var productSchema = require('./product.js')

// create the Policy Schema
var outletSchema = new mongoose.Schema({
  outletname: {
    type: String,
    required: true
  },

  outletaddress: {
    type: String
  },

  outletnumber: {
    type: String
  },
  products:
  [{
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  }]

})

var Outlet = mongoose.model('Outlet', outletSchema)

module.exports = Outlet
