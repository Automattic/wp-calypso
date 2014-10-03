
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

function Follow(site_id, wpcom){
  if (!site_id) {
    throw new Error('`site id` is not correctly defined');
  }

  if (!(this instanceof Follow)) return new Follow(site_id, wpcom);

  this.wpcom = wpcom;
  this._sid = site_id;
}

/**
 * Follow the site
 *
 * @param {Object} [query]
 * @param {Function} fn
 */

Follow.prototype.follow =
Follow.prototype.add = function(query, fn) {
  var path = '/sites/' + this._sid + '/follows/new';
  this.wpcom.sendRequest({ method: 'POST', path: path }, query, null, fn);
};

/**
 * Unfollow the site
 *
 * @param {Object} [query]
 * @param {Function} fn
 */

Follow.prototype.unfollow =
Follow.prototype.del = function(query, fn) {
  var path = '/sites/' + this._sid + '/follows/mine/delete';
  this.wpcom.sendRequest({method: 'POST', path: path}, query, null, fn);
};

/**
 * Get the follow status for current 
 * user on current blog site
 *
 * @param {Object} [query]
 * @param {Function} fn
 */

Follow.prototype.state =
Follow.prototype.mine = function(query, fn) {
  var path = '/sites/' + this._sid + '/follows/mine';
  this.wpcom.sendRequest(path, query, null, fn);
};

/**
 * Expose `Follow` module
 */

module.exports = Follow;
