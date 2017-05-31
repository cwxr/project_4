var express = require('express')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var validator = require('express-validator')
var ejs = require('ejs')
var engine = require('ejs-mate')
var session = require('express-session')
var mongoose = require('mongoose')
var MongoStore = require('connect-mongo')(session)
var passport = require('passport')
var flash = require('connect-flash')

var app = express()

// setup DB
mongoose.Promise = global.Promise
var dbURI = process.env.MONGO_URI
mongoose.connect(dbURI)
// mongoose.connect('mongodb://localhost:27017/ms')

require('./config/passport')
require('./secret/secret')

// setup the method override
var methodOverride = require('method-override')
app.use(methodOverride('_method'))

app.use(express.static('public'))
app.engine('ejs', engine)
app.set('view engine', 'ejs')
app.use(cookieParser())

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.use(validator())

app.use(session({
  secret: 'testkey',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection})
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
app.use(function (req, res, next) {
 // before every route, attach the flash messages and current user to res.locals
  res.locals.alerts = req.flash()
  res.locals.currentUser = req.user
  next()
})

var outlet = require('./routes/outlet')
app.use('/home', outlet)

var product = require('./routes/product')
app.use('/home', product)

var transaction = require('./routes/transaction')
app.use('/home', transaction)

require('./routes/user')(app)

app.listen(process.env.PORT || 3000, function () {
  console.log('Listening on port 3000')
})
