
/**
 * Module dependencies.
 */

var req = require('./req');
var debug = require('debug')('wp-connect:site');

/**
 * Create a Site instance
 *
 * @param {Site} wpconn
 * @api public
 */

function Site(wpconn){
  if (!(this instanceof Site)) return new Site(wpconn);
  this.wpconn = wpconn;
}

/**
 * Expose `Site` module
 */

module.exports = Site;
