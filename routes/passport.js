const passport = require('passport');

// Your Passport.js configuration
// For example, using passport-local strategy
passport.use(new LocalStrategy(
  function(username, password, done) {
    // Logic to authenticate user
    // Call done(err, user) with the authenticated user or false if authentication fails
  }
));

// Middleware to initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Routes for login
app.post('/login', passport.authenticate('local', { successRedirect: '/posts', failureRedirect: '/login' }));

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Now you can use ensureAuthenticated middleware in your routes
app.get('/posts', ensureAuthenticated, function(req, res) {
  // Here req.user will be populated with the authenticated user's information
  const userId = req.user.id;
  // Fetch posts for the current user from the database
  client.query('SELECT * FROM user_posts WHERE user_id = $1', [userId], (err, result) => {
    if (err) {
      console.error('Error fetching posts:', err.stack);
      res.status(500).send('Error fetching posts');
      return;
    }
    const posts = result.rows;
    res.render('posts', { title: 'Group UG03 BLOG', posts: posts });
  });
});
