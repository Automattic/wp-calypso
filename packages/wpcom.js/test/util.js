
/**
 * Module dependencies
 */

var tdata = require('./data');
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
  var wpconn = WPCONN();
  wpconn.token(tdata.token);

  return wpconn;
};

/**
 * Create a new WPCONN instance
 * setting with a public site id
 *
 * @api public
 */

Util.public_site = function(){
  var wpconn = WPCONN();
  wpconn.token(tdata.token);
  wpconn.site.id(tdata.public_site);

  return wpconn;
};

/**
 * Create a new WPCONN instance
 * setting with a private site id
 *
 * @api public
 */

Util.private_site = function(){
  var wpconn = WPCONN();
  wpconn.token(tdata.token);
  wpconn.site.id(tdata.private_site);

  return wpconn;
};

/**
 * Export module
 */

module.exports = Util;
