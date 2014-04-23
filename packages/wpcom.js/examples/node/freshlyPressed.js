
// anonymous auth since `freshlyPressed()` doesn't require auth
var WPCOM = require('../../')();

WPCOM.freshlyPressed(function (err, res) {
  if (err) throw err;
  console.log(res);
});
