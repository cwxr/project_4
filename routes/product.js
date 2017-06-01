var express = require('express')
var router = express.Router()
var Product = require('../models/product')
var Outlet = require('../models/outlet')
var passport = require('../config/passport')
var Transaction = require('../models/transaction')
var moment = require('moment')

// SEARCH PRODUCTS

// DISPLAY ALL PRODUCTS
// router.get('/', function (req, res) {
//   Product.find({}, function (err, product) {
//     if (err) {
//       console.log(err)
//     } else {
//       res.render('home', {title: 'Home', product: product})
//     }
//     // res.render('/home', {outlet: outlet})
//   })
// })

// show the createproduct form
router.get('/createproduct', function (req, res) {
  if (res.locals.currentUser.role === 'admin') {
    Outlet.find({}, function (err, outlets) {
      res.render('product/createproduct', {title: 'Create Product', outlet: outlets})
    })
  } else {
    res.redirect('/home')
  }
})

// CREATE THE PRODUCT
router.post('/createproduct', function (req, res) {
  // create client when we receive the post request
  var newProduct = new Product({
    productname: req.body.productname,
    qty: req.body.qty,
    productdesc: req.body.productdesc,
    sku: req.body.sku,
    outlets: req.body.outletname
  })
  newProduct.save(function (err) {
    if (err) res.send(err)
    res.redirect('/home')
  })
})

// UPDATE PRODUCTS
router.get('/updateproduct/:id', function (req, res) {
  console.log('====================')
  Product.findById(req.params.id, function (err, product) {
    if (err) next()
    res.render('product/updateproduct', {title: 'Update Product', product: product})
  })
})

router.put('/updateproduct/:id', function (req, res, next) {
  console.log('hre')
  Product.findByIdAndUpdate(req.params.id, {
    productname: req.body.productname,
    qty: req.body.qty,
    productdesc: req.body.productdesc,
    sku: req.body.sku
  }, function (err, product) {
    if (err) next()
    req.flash('success', 'Updating of Product is Successful')
    console.log(req.flash())
    res.redirect('/home/showproduct')
  })
})

// UPDATE QTY FUNCTION
router.put('/updateqty/:id', function (req, res, next) {
  Product.findById(req.params.id, function (err, product) {
    var date = moment().format('LL')
    var newTransaction = new Transaction({
      tdate: date,
      tqty: req.body.qty,
      products: product._id,
      outlets: req.body.outletname

    })
    newTransaction.save(function (err) {
      console.log(err)
    })
    var updatedQty = product.qty - req.body.qty
    Product.findByIdAndUpdate(req.params.id, {
      qty: updatedQty
    }, function (err, product) {
      if (err) next()
      console.log(req.flash('success'))
      req.flash('success', 'Updating of Product is Successful')
      res.redirect('/home')
    })
  })
})

// SHOW PRODUCTS
router.get('/showproduct', function (req, res) {
  if (res.locals.currentUser.role === 'admin') {
    Product.find({}, function (err, product) {
      res.render('product/showproduct', {title: 'Show Products', products: product})
    })
  } else {
    res.redirect('/home')
  }
})

// DELETE PRODUCTS
router.delete('/deleteproduct/:id', function (req, res, next) {
  Product.findByIdAndRemove(req.params.id, function (err) {
    if (err) next()
    req.flash('success', 'Product has been deleted')
    res.redirect('/home')
  })
})

module.exports = router
