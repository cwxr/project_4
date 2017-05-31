var mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs')

var userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  role: {
    type: String,
    default: 'user'
  },
  passwordResetToken: {
    type: String,
    default: ''
  },
  passwordResetExpires: {
    type: Date,
    default: Date.now
  }
})

userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
}

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

module.exports = mongoose.model('User', userSchema)
