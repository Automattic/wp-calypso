
/**
 * Module dependencies.
 */

var debug = require('debug')('wpcom:me');

/**
 * Create a Me instance
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
 * @param {Object} params (optional)
 * @param {Function} fn
 * @api public
 */

Me.prototype.info = function(params, fn){
  this.wpcom.req.send('me.get', null, params, fn);
};

/**
 * A list of the current user's sites
 *
 * @param {Object} params (optional)
 * @param {Function} fn
 * @api private
 */

Me.prototype.sites = function(params, fn){
  this.wpcom.req.send('me.sites', null, params, fn);
};

/**
 * List the currently authorized user's likes
 *
 * @param {Object} params (optional)
 * @param {Function} fn
 * @api public
 */

Me.prototype.likes = function(params, fn){
  this.wpcom.req.send('me.likes', null, params, fn);
};

/**
 * A list of the current user's group
 *
 * @param {Object} params (optional)
 * @param {Function} fn
 * @api public
 */

Me.prototype.groups = function(params, fn){
  this.wpcom.req.send('me.groups', null, params, fn);
};

/**
 * A list of the current user's connections to third-party services
 *
 * @param {Object} params (optional)
 * @param {Function} fn
 * @api public
 */

Me.prototype.connections = function(params, fn){
  this.wpcom.req.send('me.connections', null, params, fn);
};

/**
 * Expose `Me` module
 */

module.exports = Me;
