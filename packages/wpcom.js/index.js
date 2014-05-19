
/**
 * Module dependencies.
 */

var Me = require('./lib/me');
var Site = require('./lib/site');
var utilrequest = require('./lib/util/request');
var debug = require('debug')('wpcom');

/**
 * WordPress.com REST API class.
 *
 * @api public
 */

function WPCOM(request){
  if (!(this instanceof WPCOM)) return new WPCOM(request);
  if ('function' !== typeof request) {
    throw new TypeError('a `request` WP.com function must be passed in');
  }

  this.request = request;
}

/**
 * Get `Me` object instance
 *
 * @api public
 */

WPCOM.prototype.me = function(){
  return new Me(this);
};

/**
 * Get `Site` object instance
 *
 * @param {String} id
 * @api public
 */

WPCOM.prototype.site = function(id){
  return new Site(id, this);
};

/**
 * List Freshly Pressed Posts
 *
 * @param {Object} [query]
 * @param {Function} fn callback function
 * @api public
 */

WPCOM.prototype.freshlyPressed = function(query, fn){
  this.sendRequest('/freshly-pressed', query, null, fn);
};

/**
 * Expose util/request in sendRequest
 */

WPCOM.prototype.sendRequest = utilrequest;

/**
 * Expose `WPCOM` module
 */

module.exports = WPCOM;
