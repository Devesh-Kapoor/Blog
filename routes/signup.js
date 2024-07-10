const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'UG003',
  password: 'Password',
  port: 5432,
});
client.connect(err => {
  if (err) throw err;
  console.log("Connected!");
});




/* GET signup page. */
router.get('/', (req, res) => {
  res.render('signup', { title: 'Group UG03 Blog' });
});


/* Signup user */
router.post('/', async (req, res) => {
  const { email, username, password } = req.body;
  const two_authenication = req.body.two_authenication;

  // 2FA
  var speakeasy = require('speakeasy');
              
  var verified = speakeasy.totp.verify({
      secret: 'RkyHSm*^Gvi!n$pl5FSWtTdHtL/?Ulvm' ,
      encoding: 'ascii',
      token: two_authenication
})


  try {
    // Validate inputs
    if (!email || !username || !password) {
      // Tell the user to fill in all fields
      return res.status(400).render('signup', { title: 'Group UG03 Blog', error: 'Please fill in all fields' });
    }
    if (password.length < 8) {
      // Tell the user to enter a password that is at least 8 characters long
      return res.status(400).render('signup', { title: 'Group UG03 Blog', error: 'Password must be at least 8 characters long' });
    }
    if (!password.match(/[A-Z]/)) {
      // Tell the user to enter a password that contains at least one capital letter
      return res.status(400).render('signup', { title: 'Group UG03 Blog', error: 'Password must contain at least one capital letter' });
    }
    if (!password.match(/[0-9]/)) {
      // Tell the user to enter a password that contains at least one number
      return res.status(400).render('signup', { title: 'Group UG03 Blog', error: 'Password must contain at least one number' });
    }
    if (!password.match(/[a-zA-Z]/)) {
      // Tell the user to enter a password that contains at least one letter
      return res.status(400).render('signup', { title: 'Group UG03 Blog', error: 'Password must contain at least one letter' });
    }
    if (!password.match(/[^a-zA-Z0-9]/)) {
      // Tell the user to enter a password that contains at least one special character
      return res.status(400).render('signup', { title: 'Group UG03 Blog', error: 'Password must contain at least one special character' });
    }
    if (username.match(/[^a-zA-Z0-9]/)) {
      // Tell the user to enter a username that does not contain special characters
      return res.status(400).render('signup', { title: 'Group UG03 Blog', error: 'Username must not contain special characters' });
    }
    if (username.indexOf(' ') >= 0 || password.indexOf(' ') >= 0) {
      // Tell the user to enter a username or password that does not contain spaces
      return res.status(400).render('signup', { title: 'Group UG03 Blog', error: 'Username and password must not contain spaces' });
    }
    if (email.indexOf('@') === -1 || email.indexOf('.') === -1) {
      // Tell the user to enter a valid email address
      return res.status(400).render('signup', { title: 'Group UG03 Blog', error: 'Please enter a valid email address' });
    }

    // Check if username or email already exists
    const existingUsers = await client.query(`SELECT username, email FROM "USERS" WHERE username = $1 OR email = $2`, [username, email]);
    if (existingUsers.rows.some(user => user.username === username)) {
      return res.status(400).render('signup', { title: 'Group UG03 Blog', error: 'Username already in use' });
    }
    if (existingUsers.rows.some(user => user.email === email)) {
      return res.status(400).render('signup', { title: 'Group UG03 Blog', error: 'Email already in use' });
    }

    // Hash the password
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);

    if (!verified) {
      // Tell the user to enter a valid 2FA code
      return res.status(400).render('signup', { title: 'Group UG03 Blog', error: 'Invalid 2FA code' });
    }else {
      console.log('2FA code verified');
      // Insert the new user into the database
      await client.query(`INSERT INTO "USERS" (username, password, email) VALUES ($1, $2, $3)`, [username, hash, email]);
      console.log('User added');

      // Redirect to login page
      res.redirect('/login');
    }

  } catch (err) {
    console.error('Error signing up:', err.stack);
    res.status(500).render('signup', { title: 'Group UG03 Blog', error: 'An error occurred. Please try again later.' });
  }
});

module.exports = router;