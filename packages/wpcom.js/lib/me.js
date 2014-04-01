
/**
 * Module dependencies.
 */

var debug = require('debug')('wp-connect:me');

/**
 * Create a Me instance
 *
 * @param {Me} wpconn
 * @api public
 */

function Me(wpconn){
  if (!(this instanceof Me)) return new Me(wpconn);
  this.wpconn = wpconn;
}

/**
 * Require user information
 *
 * @param {Function} fn
 * @api public
 */

Me.prototype.info = function(params, fn){
  this.wpconn.req.exec('me.get', null, params, fn);
};

/**
 * Expose `Me` module
 */

module.exports = Me;
