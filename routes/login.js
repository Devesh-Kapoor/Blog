const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Client } = require('pg');

// setting the client up at not authorised as they have not yet logged in


const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'UG003',
  password: 'Password',
  port: 5432,
});
client.connect();

const loginDelay = (req, res, next) => {
  setTimeout(next, 2000);
};

router.get('/', function(req, res, next) {
  res.render('login', { title: 'UG03 Blog' });
});

router.post('/', loginDelay, function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;
  const two_authenication = req.body.two_authenication;
  const selectQuery = `SELECT * FROM "USERS" WHERE username = $1`;
  const values = [username];
  

  // 2FA
  var speakeasy = require('speakeasy');
  var authenticated = false;
          
  var verified = speakeasy.totp.verify({
      secret: 'RkyHSm*^Gvi!n$pl5FSWtTdHtL/?Ulvm' ,
      encoding: 'ascii',
      token: two_authenication
  })


  
  

  client.query(selectQuery, values, (err, result) => {
    if (err) {
      console.error('Error executing query', loginDelay, err);
      return res.status(400).render('login', { title: 'Group UG03 Blog', error: 'Incorrect username/password' });
    }

    if (result.rows.length > 0) {
      const user = result.rows[0];
      bcrypt.compare(password, user.password, (bcryptErr, bcryptResult) => {
        if (bcryptErr) {
          console.error('Error comparing passwords', bcryptErr);
          return res.status(400).render('login', { title: 'Group UG03 Blog', error: 'Incorrect username/password' });
        }
        else if (username == '' || password == '') {
          //tell the user to fill in all fields
          console.log('No details entered');
          return res.status(400).render('login', { title: 'Group UG03 Blog', error: 'Incorrect username/password' });
        }
        //if the length of the password is less than 8, tell the user to enter a password that is at least 8 characters long
        else if (password.length < 8) {
          //tell the user to fill in all fields
          console.log('Password must be at least 8 characters long');
          return res.status(400).render('login', { title: 'Group UG03 Blog', error: 'Incorrect username/password' });
        }
        // Ensure passwords have got a capital letter
        else if (!password.match(/[A-Z]/)) {
          //tell the user to fill in all fields
          console.log('Password must contain at least one capital letter');
          return res.status(400).render('login', { title: 'Group UG03 Blog', error: 'Incorrect username/password' });
        }
        //make sure there are no spaces in the username
        else if (username.indexOf(' ') >= 0) {
          //tell the user to fill in all fields
          console.log('No spaces allowed in password or username');
          return res.status(400).render('login', { title: 'Group UG03 Blog', error: 'Incorrect username/password' });
        }
        //ensure there are no special characters in the username
        else if (username.match(/[^a-zA-Z0-9]/)) {
          //tell the user to fill in all fields
          console.log('Username Must not contain special characters');
          return res.status(400).render('login', { title: 'Group UG03 Blog', error: 'Incorrect username/password' });
        }
        //check to see if there are any spaces in the password
        else if (password.indexOf(' ') >= 0) {
          //tell the user to fill in all fields
          console.log('Username and password must not contain spaces');
          return res.status(400).render('login', { title: 'Group UG03 Blog', error: 'Incorrect username/password' });
        }
        //ensure the password contains at least one number
        else if (!password.match(/[0-9]/)) {
          //tell the user to fill in all fields
          console.log('Password must contain at least one number');
          return res.status(400).render('login', { title: 'Group UG03 Blog', error: 'Incorrect username/password' });
        }
        //ensure the password contains at least one letter
        else if (!password.match(/[a-zA-Z]/)) {
          //tell the user to fill in all fields
          console.log('Password must have one letter');
          return res.status(400).render('login', { title: 'Group UG03 Blog', error: 'Incorrect username/password' });
        }
        //ensure the password contains at least one special character
        else if (!password.match(/[^a-zA-Z0-9]/)) {
          //tell the user to fill in all fields
          console.log('Password must contain at least one special character');
          return res.status(400).render('login', { title: 'Group UG03 Blog', error: 'Incorrect username/password' });   
        }
        else if (bcryptResult) {
        if (bcryptResult) {
          console.log('User authenticated');
          req.session.user = { id: user.user_id, username: user.username };
          // req.session.save();

          if (verified) {
            console.log('token correct');
            global.authenticated == true;
            // Redirect to posts (optional, redirect logic might be elsewhere)
            return res.redirect('/posts');
          } else {
            console.log('token incorrect');
            return res.status(400).render('login', { title: 'Group UG03 Blog', error: 'Error in log in' });
          }
        } else {
          // Tell the user that the username or password is incorrect and the login had failed
          console.log('Username/Password incorrect');
          return res.status(400).render('login', { title: 'Group UG03 Blog', error: 'Incorrect username/password' });
        }
      }});
    } else {
      // Tell the user that the username or password is incorrect and the login had failed as all other possibilities have been checked
      console.log('Username or Password incorrect');
      return res.status(400).render('login', { title: 'Group UG03 Blog', error: 'Incorrect username/password' });
    }
  });
});

module.exports = router;