
/**
 * Module dependencies.
 */

var debug = require('debug')('wpcom:like');

/**
 * Like methods
 *
 * @param {String} pid post id
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 * @api public
 */

function Like(pid, sid, wpcom){
  if (!sid) {
    throw new Error('`side id` is not correctly defined');
  }

  if (!pid) {
    throw new Error('`post id` is not correctly defined');
  }

  if (!(this instanceof Like)) return new Like(pid, sid, wpcom);

  this.wpcom = wpcom;
  this._pid = pid;
  this._sid = sid;
}

/**
 * Get your Like status for a Post
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Like.prototype.mine = function(query, fn){
  var path = '/sites/' + this._sid + '/posts/' + this._pid + '/likes/mine';
  this.wpcom.sendRequest(path, query, null, fn);
};

/**
 * Like a post
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Like.prototype.add = function(query, fn){
  var path = '/sites/' + this._sid + '/posts/' + this._pid + '/likes/new';
  this.wpcom.sendRequest({ path: path, method: 'post' }, query, null, fn);
};

/**
 * Remove your Like from a Post
 *
 * @param {Function} fn
 * @api public
 */

Like.prototype['delete'] =
Like.prototype.del = function(fn){
  var path = '/sites/' + this._sid + '/posts/' + this._pid + '/likes/mine/delete';
  this.wpcom.sendRequest({ path: path, method: 'post' }, null, null, fn);
};

/**
 * Expose `Like` module
 */

module.exports = Like;
