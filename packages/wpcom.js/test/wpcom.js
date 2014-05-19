
/**
 * WPCOM vars
 */

var WPCOM;
var wpcom;

/**
 * Detect side
 */

if ('undefined' != typeof window) {
  WPCOM = require('../wpcom+proxy');
  wpcom = WPCOM();

  wpcom.request({
    metaAPI: { accessAllUsersBlogs: true }
  }, function(err) {
    if (err) throw err;
    console.log('proxy now running in "access all user\'s blogs" mode');
  });

} else {
  WPCOM = require('../');

  var test = require('./data');
  wpcom = WPCOM(test.token.global);
}

/**
 * Expose WPCOM instance
 */

module.exports = wpcom;
