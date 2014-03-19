
/**
 * Module dependencies.
 */

var Action = require('./lib/action');
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

  // post methods
  this.post = new Action('post', this);
}

/**
 * Set Access token
 *
 * @param {String} token
 * @api public
 */

WPCONN.prototype.setToken = function(token){
  this.opts.token = token;
};

/**
 * User profile
 *
 * @param {Object} opts (optional)
 * @param {Function} fn
 * @api private
 */

WPCONN.prototype.me = function (fn){
  req('me', null, { token: this.opts.token }, fn);
};

/**
 * Expose `WPCONN` module
 */

module.exports = WPCONN;
