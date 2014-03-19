
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
  var wpconn = new WPCONN();
  var token = tdata.token;
  wpconn.setToken(token);

  return wpconn;
};

/**
 * Create a new WPCONN instance sitting site id
 *
 * @api public
 */

Util.site = function(){
  var wpconn = new WPCONN();
  var token = tdata.token;
  wpconn.setToken(token);
  wpconn.site.setId(tdata.site);

  return wpconn;
};


/**
 * Export module
 */

module.exports = Util;
