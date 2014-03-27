
/**
 * Module dependencies.
 */

var Site = require('./lib/site');
var req = require('./lib/req');
var debug = require('debug')('wp-connect');

/**
 * Wordpress connect class
 *
 * @api public
 */

function WPCONN(){
  if (!(this instanceof WPCONN)) return new WPCONN();

  // request instance
  this.req = new req(this);

  // site stuff
  this.site = new Site(this);
}

/**
 * Set Access token
 *
 * @param {String} token
 * @api public
 */

WPCONN.prototype.token = function(token){
  this.tkn = token;
};

/**
 * User profile
 *
 * @param {Function} fn
 * @api private
 */

WPCONN.prototype.me = function (fn){
  this.req.exec('me', null, fn);
};

/**
 * Expose `WPCONN` module
 */

module.exports = WPCONN;
