var router = require('express').Router();
var app = require('../app.js');

/* GET home page. */
router.get('/connectedDevices', function(req, res) {
  res.send(connectedDevicesCache.getConnectedDevices());
});

app.use('/maps', router);
module.exports = router;
