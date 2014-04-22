
/**
 * Module dependencies.
 */

var debug = require('debug')('wpcom:me');

/**
 * Create a `Me` instance
 *
 * @param {WPCOM} wpcom
 * @api public
 */

function Me(wpcom){
  if (!(this instanceof Me)) return new Me(wpcom);
  this.wpcom = wpcom;
}

/**
 * Meta data about auth token's User
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Me.prototype.get = function(query, fn){
  this.wpcom.sendRequest('me.get', null, { query: query }, fn);
};

/**
 * A list of the current user's sites
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api private
 */

Me.prototype.sites = function(query, fn){
  this.wpcom.sendRequest('me.sites', null, { query: query }, fn);
};

/**
 * List the currently authorized user's likes
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Me.prototype.likes = function(query, fn){
  this.wpcom.sendRequest('me.likes', null, { query: query }, fn);
};

/**
 * A list of the current user's group
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Me.prototype.groups = function(query, fn){
  this.wpcom.sendRequest('me.groups', null, { query: query }, fn);
};

/**
 * A list of the current user's connections to third-party services
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Me.prototype.connections = function(query, fn){
  this.wpcom.sendRequest('me.connections', null, { query: query }, fn);
};

/**
 * Expose `Me` module
 */

module.exports = Me;
