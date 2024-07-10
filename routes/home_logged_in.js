var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home_logged_in', { title: 'Group UG03 BLOG' });
});

module.exports = router;
