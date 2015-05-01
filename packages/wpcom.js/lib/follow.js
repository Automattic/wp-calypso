
/**
 * Module dependencies.
 */

var debug = require('debug')('wpcom:follow');

/**
 * Follow 
 *
 * @param {String} site_id - site id
 * @param {WPCOM} wpcom
 * @api public
 */

function Follow(site_id, wpcom) {
  if (!site_id) {
    throw new Error('`site id` is not correctly defined');
  }

  if (!(this instanceof Follow)) {
    return new Follow(site_id, wpcom);
  }

  this.wpcom = wpcom;
  this._sid = site_id;
}

/**
 * Get the follow status for current 
 * user on current blog sites
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Follow.prototype.mine =
Follow.prototype.state = function (query, fn) {
  var path = '/sites/' + this._sid + '/follows/mine';
  return this.wpcom.req.get(path, query, fn);
};

/**
 * Follow the site
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Follow.prototype.follow =
Follow.prototype.add = function (query, fn) {
  var path = '/sites/' + this._sid + '/follows/new';
  return this.wpcom.req.put(path, query, null, fn);
};

/**
 * Unfollow the site
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Follow.prototype.unfollow =
Follow.prototype.del = function (query, fn) {
  var path = '/sites/' + this._sid + '/follows/mine/delete';
  return this.wpcom.req.del(path, query, null, fn);
};

/**
 * Expose `Follow` module
 */

module.exports = Follow;