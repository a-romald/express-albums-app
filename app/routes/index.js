var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index/index', { title: 'Express App', messages: req.flash('info') });
});

module.exports = router;
