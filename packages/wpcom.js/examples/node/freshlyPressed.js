
var WPCOM = require('../../');

// anonymous auth since `freshlyPressed()` doesn't require auth
var wpcom = WPCOM();

wpcom.freshlyPressed(function (err, res) {
  if (err) throw err;
  console.log(res);
});
