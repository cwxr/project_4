var passport = require('passport')
var User = require('../models/user')
var LocalStrategy = require('passport-local').Strategy

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  })
})

passport.use('local.signup', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, (req, username, password, done) => {
  User.findOne({'username': username}, (err, user) => {
    if (err) {
      return done(err)
    }

    if (user) {
      return done(null, false, req.flash('error', 'Username Already Exist.'))
    }

    var newUser = new User()
    newUser.username = req.body.username
    newUser.email = req.body.email
    newUser.password = newUser.encryptPassword(req.body.password)
    newUser.role = req.body.role

    newUser.save((err) => {
      return done(null, newUser)
    })
  })
}))

passport.use('local.login', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, (req, username, password, done) => {
  User.findOne({'username': username}, (err, user) => {
    if (err) {
      return done(err)
    }

    var messages = []

    if (!user || !user.validPassword(password)) {
      messages.push('Username Does Not Exist Or Password is Invalid')
      return done(null, false, req.flash('error', messages))
    }

    return done(null, user)
  })
}))
