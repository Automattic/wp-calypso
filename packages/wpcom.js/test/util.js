
/**
 * Module dependencies
 */

var test = require('./data');
var WPCONN = require('../');

/**
 * `Util` module
 */

function Util(){}

/**
 * Create a WPCONN instance
 *
 * @api public
 */

Util.wpconn = function(){
  return WPCONN(test.token);
};

/**
 * Create a new WPCONN instance
 * setting with a public site id
 *
 * @api public
 */

Util.public_site = function(){
  var wpconn = WPCONN(test.token);
  wpconn.site.id(test.public_site);
  return wpconn;
};

/**
 * Create a new WPCONN instance
 * setting with a private site id
 *
 * @api public
 */

Util.private_site = function(){
  var wpconn = WPCONN(test.token);
  wpconn.site.id(test.private_site);
  return wpconn;
};

/**
 * Export module
 */

module.exports = Util;
