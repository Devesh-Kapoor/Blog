var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('profile', { title: 'Group UG03 BLOG' });
});

module.exports = router;
