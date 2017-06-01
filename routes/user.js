var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var nodemailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport')
var async = require('async')
var crypto = require('crypto')
var User = require('../models/user')
var secret = require('../secret/secret')

module.exports = (app) => {
  app.get('/', (req, res, next) => {
    console.log('hi')
    res.render('index', {title: 'Index || EOS'})
  })

  app.get('/signup', (req, res) => {
    var errors = req.flash('error')
    res.render('user/signup', {title: 'Sign Up || EOS', messages: errors, hasErrors: errors.length > 0})
  })

  app.post('/signup', validate, passport.authenticate('local.signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
  }))

  app.get('/login', (req, res) => {
    console.log('hello')
    var errors = req.flash('error')
    res.render('user/login', {title: 'Login || EOS', messages: errors, hasErrors: errors.length > 0})
  })

  app.post('/login', loginValidation, passport.authenticate('local.login', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
  }))

  // app.get('/home', (req, res) => {
  //   res.render('home', {title: 'Home || EOS'})
  // })

  app.get('/forgot', (req, res) => {
    var errors = req.flash('error')
    var info = req.flash('info')

    res.render('user/forgot', {title: 'Request Password Reset', messages: errors, hasErrors: errors.length > 0, info: info, noErrors: info.length > 0})
  })

  app.post('/forgot', (req, res, next) => {
    async.waterfall([
      function (callback) {
        crypto.randomBytes(20, (err, buf) => {
          var rand = buf.toString('hex')
          callback(err, rand)
        })
      },
      function (rand, callback) {
        User.findOne({'email': req.body.email}, (err, user) => {
          if (!user) {
            req.flash('error', 'No Account With That Email Exists')
            return res.redirect('/forgot')
          }

          user.passwordResetToken = rand
          user.passwordResetExpires = Date.now() + 60 * 60 * 1000

          user.save((err) => {
            callback(err, rand, user)
          })
        })
      },
      function (rand, user, callback) {
        var smtpTransport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.user,
            pass: process.env.pass
          }
        })
        var mailOptions = {
          to: user.email,
          from: 'EOS ' + '<' + process.env.user + '>',
          subject: 'EOS Application Reset Token',
          text: 'You have requested for a password reset token. \n\n' +
                    'Please click on the link to complete the process: \n\n' +
                    'https://selltrue2.herokuapp.com/reset/' + rand + '\n\n'
        }
        smtpTransport.sendMail(mailOptions, (err, response) => {
          req.flash('info', 'A password reset token has been sent to' + user.email)
          return callback(err, user)
        })
      }
    ], (err) => {
      if (err) {
        return next(err)
      }
      res.redirect('/forgot')
    })
  })
  app.get('/reset/:token', (req, res) => {
    User.findOne({passwordResetToken: req.params.token, passwordResetExpires: {$gt: Date.now()}}, (err, user) => {
      if (!user) {
        req.flash('error', 'Password token has expired or is invalid.')
        return res.redirect('/reset/' + req.params.token)
      }
      var errors = req.flash('error')
      var success = req.flash('success')
      res.render('user/reset', {title: 'Reset Your Password', messages: errors, hasErrors: errors.length > 0, success: success, noErrors: success.length > 0})
    })
  })
  app.post('./reset/:token', (req, res) => {
    async.waterfall([
      function (callback) {
        User.findOne({passwordResetToken: req.params.token, passwordResetExpires: {$gt: Date.now()}}, (err, user) => {
          if (!user) {
            req.flash('error', 'Password token has expired or is invalid.')
            return res.redirect('/forgot')
          }

          req.checkBody('password', 'Password is Required').notEmpty()
          req.checkBody('password', 'Password Must Not Be Less Than 4 Characters').isLength({min: 4})

          var errors = req.validationErrors()

          if (req.body.password = req.body.cpassword) {
            if (errors) {
              var messages = []
              errors.forEach((error) => {
                messages.push(error.msg)
              })
              var errors = req.flash(error)
              res.redirect('/reset/' + req.params.token)
            } else {
              user.password = req.body.password
              user.passwordResetToken = undefined
              user.passwordResetExpires = undefined

              user.save((err) => {
                req.flash('success', 'Your password has been successfully updated')
                callback(err, user)
              })
            }
          } else {
            req.flash('error', 'Password and Confirm Password does not match')
            res.redirect('/reset/' + req.params.token)
          }
        })
      },
      function (user, callback) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: secret.auth.user,
            pass: secret.auth.pass
          }
        })
        var mailOptions = {
          to: user.email,
          from: 'EOS ' + '<' + secret.auth.user + '>',
          subject: 'Your password has been updated',
          text: 'This is a confirmation email that you have updated your password for' + user.email
        }
        smtpTransport.sendMail(mailOptions, (err, response) => {
          callback(err, user)

          var error = req.flash('error')
          var success = req.flash('success')

          res.render('user/reset', {title: 'Reset Your Password', messages: error, hasErrors: error.length > 0, success: success, noErrors: success.length > 0 })
        })
      }
    ])
  })

  app.get('/logout', (req, res) => {
    req.logout()

    req.session.destroy((err) => {
      res.redirect('/')
    })
  })
}

function validate (req, res, next) {
  req.checkBody('username', 'Username is Required').notEmpty()
  req.checkBody('username', 'Username Must Not Be Less Than 3 Characters').isLength({min: 3})
  req.checkBody('email', 'Email is Required').notEmpty()
  req.checkBody('email', 'Email is Invalid').isEmail()
  req.checkBody('password', 'Password is Required').notEmpty()
  req.checkBody('password', 'Password Must Not Be Less Than 4 Characters').isLength({min: 4})

  var errors = req.validationErrors()

  if (errors) {
    var messages = []
    errors.forEach((error) => {
      messages.push(error.msg)
    })
    req.flash('error', messages)
    res.redirect('/signup')
  } else {
    return next()
  }
}

function loginValidation (req, res, next) {
  req.checkBody('username', 'Username is Required').notEmpty()
  req.checkBody('username', 'Username Must Not Be Less Than 3 Characters').isLength({min: 3})
  req.checkBody('password', 'Password is Required').notEmpty()
  req.checkBody('password', 'Password Must Not Be Less Than 4 Characters').isLength({min: 4})

  var loginErrors = req.validationErrors()

  if (loginErrors) {
    var messages = []
    loginErrors.forEach((error) => {
      messages.push(error.msg)
    })
    req.flash('error', messages)
    res.redirect('/login')
  } else {
    return next()
  }
}
