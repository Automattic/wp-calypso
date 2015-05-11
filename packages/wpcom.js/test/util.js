
/**
 * Module dependencies
 */

var WPCOM = require('../');

try {
  var config = require('./config');
} catch (ex) {
  var config = {};
}

/**
 * Detect client/server side
 */

var is_client_side = 'undefined' !== typeof window;

/**
 * Config vars
 */

var token = process.env.TOKEN || config.token;
var site = process.env.SITE || config.site;

/**
 * Testing data
 */

var fixture = require('./fixture');

module.exports = {
  wpcom: wpcom,
  wpcom_public: function() { return WPCOM(); },
  site: function () { return site; }
};

function wpcom() {
  if (is_client_side) {
    var proxy = require('../node_modules/wpcom-proxy-request');
    var _wpcom = WPCOM(proxy);

    _wpcom.request({
      metaAPI: { accessAllUsersBlogs: true }
    }, function(err) {
      if (err) throw err;
      console.log('proxy now running in "access all user\'s blogs" mode');
    });

    return _wpcom;
  } else {
    return WPCOM(token);
  }
}
