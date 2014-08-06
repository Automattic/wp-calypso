
/**
 * Module dependencies.
 */

var debug = require('debug')('wpcom:like');

/**
 * This callback is called after finishing
 * an API request whether successful or
 * with an error.
 *
 * @callback apiCallback
 * @param {Object} error
 * @param {Object} data
 */

/**
 * Follow methods
 *
 * @param {String} site_id site id
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
};

/**
 * :FOLLOW:
 * Follow the site
 *
 * @param {Array} [query]
 * @param {apiCallback} fn
 */
Follow.prototype.follow =
Follow.prototype.new =
Follow.prototype.add = function(query, fn) {
  var path = '/sites/' + this._sid + '/follows/new';
  this.wpcom.sendRequest({method: 'POST', path: path}, query, null, fn);
};

/**
 * :FOLLOW:
 * Unfollow the site
 *
 * @param {Array} [query]
 * @param {apiCallback} fn
 */
Follow.prototype.unfollow =
Follow.prototype.remove =
Follow.prototype.del = function(query, fn) {
  var path = '/sites/' + this._sid + '/follows/mine/delete';
  this.wpcom.sendRequest({method: 'POST', path: path}, query, null, fn);
};

/**
 * :FOLLOW:
 * Get the follow status for current 
 * user on current blog site
 *
 * @param {Array} [query]
 * @param {apiCallback} fn
 */
Follow.prototype.state =
Follow.prototype.mine = function(query, fn) {
  var path = '/sites/' + this._sid + '/follows/mine';
  this.wpcom.sendRequest(path, query, null, fn);
};

module.exports = Follow;