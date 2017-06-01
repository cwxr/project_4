var express = require('express')
var router = express.Router()
var Outlet = require('../models/outlet')
var Product = require('../models/product')
var passport = require('../config/passport')
var Transaction = require('../models/transaction')
var moment = require('moment')

// FIND ALL OUTLETS & PRODUCTS
router.get('/', function (req, res) {
  Outlet.find({}, function (err, outlet) {
    Product.find({}, function (err, product) {
      var date = moment().format('LL')

      Transaction.find({tdate: date}).populate('products').exec(function (err, transaction) {
        if (err) {
          console.log(err)
        } else {
          console.log(transaction)
          res.render('home', {title: 'Home', outlet: outlet, product: product, transaction: transaction})
        }
    // res.render('/home', {outlet: outlet})
      })
    })
  })
})

// show the create outlet form
router.get('/createoutlet', function (req, res) {
  if (res.locals.currentUser.role === 'admin') {
    res.render('outlet/createoutlet', {title: 'Create Outlet'})
  } else {
    res.redirect('/home')
  }
})

// CREATE THE OUTLET
router.post('/createoutlet', function (req, res) {
  // create client when we receive the post request
  var newOutlet = new Outlet({
    outletname: req.body.outletname,
    outletaddress: req.body.outletaddress,
    outletnumber: req.body.outletnumber
  })
  newOutlet.save(function (err) {
    if (err) res.send(err)
    res.redirect('/home')
  })
})

// UPDATE OUTLETS
router.get('/updateoutlet/:id', function (req, res) {
  console.log('====================')
  Outlet.findById(req.params.id, function (err, outlet) {
    if (err) next()
    res.render('outlet/updateoutlet', {title: 'Update Outlet', outlet: outlet})
  })
})

router.put('/updateoutlet/:id', function (req, res, next) {
  Outlet.findByIdAndUpdate(req.params.id, {
    outletname: req.body.outletname,
    outletaddress: req.body.outletaddress,
    outletnumber: req.body.outletnumber
  }, function (err, outlet) {
    if (err) next()
    req.flash('success', 'Updating of Outlet is Successful')
    res.redirect('/home/showoutlet')
  })
})

// SHOW OUTLETS
router.get('/showoutlet', function (req, res) {
  if (res.locals.currentUser.role === 'admin') {
    Outlet.find({}, function (err, outlet) {
      res.render('outlet/showoutlet', {title: 'Show Outlet', outlets: outlet})
    })
  } else {
    res.redirect('/home')
  }
})

// DELETE OUTLETS
router.delete('/deleteoutlet/:id', function (req, res, next) {
  Outlet.findByIdAndRemove(req.params.id, function (err) {
    if (err) next()
    req.flash('success', 'Outlet has been deleted')
    res.redirect('/home')
  })
})

module.exports = router
