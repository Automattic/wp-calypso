
/**
 * Module dependencies.
 */

var request = require('./util/request');
var CommentLike = require('./commentlike');
var debug = require('debug')('wpcom:comment');

/**
 * Comment methods
 *
 * @param {String} [cid] comment id
 * @param {String} [pid] post id
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 * @api public
 */

function Comment(cid, pid, sid, wpcom) {
  if (!sid) {
    throw new Error('`side id` is not correctly defined');
  }

  if (!(this instanceof Comment)) {
    return new Comment(cid, pid, sid, wpcom);
  }

  this.wpcom = wpcom;
  this._cid = cid;
  this._pid = pid;
  this._sid = sid;
}

/**
 * Return a single Comment
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Comment.prototype.get = function (query, fn) {
  var path = '/sites/' + this._sid + '/comments/' + this._cid;
  return request.get(this.wpcom, null, path, query, fn);
};

/**
 * Return recent comments for a post
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Comment.prototype.replies = function (query, fn) {
  var path = '/sites/' + this._sid + '/posts/' + this._pid + '/replies/';
  return request.get(this.wpcom, null, path, query, fn);
};

/**
 * Create a comment on a post
 *
 * @param {Object} [query]
 * @param {String|Object} body
 * @param {Function} fn
 * @api public
 */

Comment.prototype.add = function (query, body, fn) {
  if ('function' === typeof body) {
    fn = body;
    body = query;
    query = {};
  }

  body = 'string' === typeof body ? { content: body } : body;

  var path = '/sites/' + this._sid + '/posts/' + this._pid + '/replies/new';
  return request.post(this.wpcom, null, path, query, body, fn);
};

/**
 * Edit a comment
 *
 * @param {Object} [query]
 * @param {String|Object} body
 * @param {Function} fn
 * @api public
 */

Comment.prototype.update = function (query, body, fn) {
  if ('function' === typeof body) {
    fn = body;
    body = query;
    query = {};
  }

  body = 'string' === typeof body ? { content: body } : body;

  var path = '/sites/' + this._sid + '/comments/' + this._cid;
  return request.put(this.wpcom, null, path, query, body, fn);
};

/**
 * Create a Comment as a reply to another Comment
 *
 * @param {Object} [query]
 * @param {String|Object} body
 * @param {Function} fn
 * @api public
 */

Comment.prototype.reply = function (query, body, fn) {
  if ('function' === typeof body) {
    fn = body;
    body = query;
    query = {};
  }
  
  body = 'string' === typeof body ? { content: body } : body;

  var path = '/sites/' + this._sid + '/comments/' + this._cid + '/replies/new';
  return request.post(this.wpcom, null, path, query, body, fn);
};

/**
 * Delete a comment
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Comment.prototype['delete'] =
Comment.prototype.del = function (query, fn) {
  var path = '/sites/' + this._sid + '/comments/' + this._cid + '/delete';
  return request.del(this.wpcom, null, path, query, fn);
};

/**
 * Create a `CommentLike` instance
 *
 * @api public
 */

Comment.prototype.like = function() {
  return CommentLike(this._cid, this._sid, this.wpcom);
};

/**
 * Get comment likes list
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Comment.prototype.likesList = function (query, fn) {
  var path = '/sites/' + this._sid + '/comments/' + this._cid + '/likes';
  return request.get(this.wpcom, null, path, query, fn);
};

/**
 * Expose `Comment` module
 */

module.exports = Comment;