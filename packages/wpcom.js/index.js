
/**
 * Module dependencies.
 */

var Site = require('./lib/site');
var req = require('./lib/req');
var debug = require('debug')('wp-connect');

/**
 * Wordpress connect class
 *
 * @param {Object} opts
 * @api public
 */

function WPCONN(opts){
  this.opts = opts || {};

  // site stuff
  this.site = new Site(this);
}

/**
 * Set Access token
 *
 * @param {String} token
 * @api public
 */

WPCONN.prototype.setToken = function(token){
  this.token = token;
};

/**
 * User profile
 *
 * @param {Object} opts (optional)
 * @param {Function} fn
 * @api private
 */

WPCONN.prototype.me = function (fn){
  req('me', null, { token: this.token }, fn);
};

/**
 * Expose `WPCONN` module
 */

module.exports = WPCONN;
