var express = require('express')
var router = express.Router()
var passport = require('../config/passport')
var Transaction = require('../models/transaction')

// show the create outlet form
router.get('/showtransaction', function (req, res) {
  if (res.locals.currentUser.role === 'admin') {
    Transaction.find({}).populate('products').populate('outlets').exec(function (err, transaction) {
      res.render('transaction/showtransaction', {title: 'Transaction', transactions: transaction})
    })
  } else {
    res.redirect('/home')
  }
})

// CREATE THE OUTLET
router.post('/showtransaction', function (req, res) {
  // create client when we receive the post request
  var newTransaction = new Transaction({
    tdate: req.body.tdate,
    tqty: req.body.tqty

  })
  newTransaction.save(function (err) {
    if (err) res.send(err)
    res.redirect('/home')
  })
})

module.exports = router
