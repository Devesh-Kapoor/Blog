var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var pgSession = require('connect-pg-simple')(session);

// CSRF protection
const csurf = require('csurf');
const csrfProtection = csurf({ cookie: true });

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/LogIn');
var signupRouter = require('./routes/signup');
var profileRouter = require('./routes/profile');
var postsRouter = require('./routes/posts');
var home_logged_inRouter = require('./routes/home_logged_in');

var app = express();

// Connect to DB
const { Pool } = require('pg');
const pgPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'UG003',
  password: 'Password',
  port: 5432,
});

app.use(session({
  store: new pgSession({
    pool: pgPool,
    tableName: 'session'
  }),
  secret: 'Secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 } // 30 days
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/profile', profileRouter);
app.use('/posts', csurf({ cookie: true }), postsRouter); // Remove csrf Protection from here
app.use('/home_logged_in', home_logged_inRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// CSRF protection
app.get('/posts', csrfProtection, (req, res) => {
  const token = req.csrfToken();
  res.render('create_post', { csrfToken: token });
});
 
app.post('/posts', csrfProtection, (req, res) => {
  const token = req.csrfToken();
  const submittedToken = req.body._csrf;
 
  if (!submittedToken || submittedToken !== token) {
    return res.status(403).send('Invalid CSRF token');
  }
});


module.exports = app;
