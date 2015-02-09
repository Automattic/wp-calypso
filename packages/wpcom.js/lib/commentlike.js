
/**
 * Module dependencies.
 */

var debug = require('debug')('wpcom:commentlike');

/**
 * CommentLike methods
 *
 * @param {String} cid comment id
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 * @api public
 */

function CommentLike(cid, sid, wpcom) {
  if (!sid) {
    throw new Error('`side id` is not correctly defined');
  }

  if (!cid) {
    throw new Error('`comment id` is not correctly defined');
  }

  if (!(this instanceof CommentLike)) {
    return new CommentLike(cid, sid, wpcom);
  }

  this.wpcom = wpcom;
  this._cid = cid;
  this._sid = sid;
}

/**
 * Get your Like status for a Comment
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

CommentLike.prototype.state =
CommentLike.prototype.mine = function (query, fn) {
  var path = '/sites/' + this._sid + '/comments/' + this._cid + '/likes/mine';
  return this.wpcom.req.get(path, query, fn);
};

/**
 * Like a comment
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

CommentLike.prototype.add = function (query, body, fn) {
  var path = '/sites/' + this._sid + '/comments/' + this._cid + '/likes/new';
  return this.wpcom.req.post(path, query, body, fn);
};

/**
 * Remove your Like from a Comment
 *
 * @param {Function} fn
 * @api public
 */

CommentLike.prototype['delete'] =
CommentLike.prototype.del = function (query, fn) {
  var path = '/sites/' + this._sid + '/comments/' + this._cid + '/likes/mine/delete';
  return this.wpcom.req.del(path, query, fn);
};

/**
 * Expose `CommentLike` module
 */

module.exports = CommentLike;