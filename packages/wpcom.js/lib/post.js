
/**
 * Module dependencies.
 */

var Like = require('./like');
var Reblog = require('./reblog');
var Comment = require('./comment');
var request = require('./util/request');
var debug = require('debug')('wpcom:post');

/**
 * Post methods
 *
 * @param {String} id
 * @param {String} sid site id
 * @param {WPCOM} wpcom
 * @api public
 */

function Post(id, sid, wpcom) {
  if (!(this instanceof Post)) {
    return new Post(id, sid, wpcom);
  }

  this.wpcom = wpcom;
  this._sid = sid;

  // set `id` and/or `slug` properties
  id = id || {};
  if ('object' !== typeof id) {
    this._id = id;
  } else {
    this._id = id.id;
    this._slug = id.slug;
  }
}

/**
 * Set post `id`
 *
 * @api public
 */

Post.prototype.id = function (id) {
  this._id = id;
};

/**
 * Set post `slug`
 *
 * @param {String} slug
 * @api public
 */

Post.prototype.slug = function (slug) {
  this._slug = slug;
};

/**
 * Get post
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Post.prototype.get = function (query, fn) {
  if (!this._id && this._slug) {
    return this.getBySlug(query, fn);
  }

  var path = '/sites/' + this._sid + '/posts/' + this._id;
  return request.get(this.wpcom, null, path, query, fn);
};

/**
 * Get post by slug
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Post.prototype.getBySlug = function (query, fn) {
  var path = '/sites/' + this._sid + '/posts/slug:' + this._slug;
  return request.get(this.wpcom, null, path, query, fn);
};

/**
 * Add post
 *
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Post.prototype.add = function (query, body, fn) {
  var path = '/sites/' + this._sid + '/posts/new';
  return request.post(this.wpcom, null, path, query, body, fn);
};

/**
 * Edit post
 *
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Post.prototype.update = function (query, body, fn) {
  var path = '/sites/' + this._sid + '/posts/' + this._id;
  return request.put(this.wpcom, null, path, query, body, fn);
};

/**
 * Delete post
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Post.prototype['delete'] =
Post.prototype.del = function (query, fn) {
  var path = '/sites/' + this._sid + '/posts/' + this._id + '/delete';
  return request.del(this.wpcom, null, path, query, fn);
};

/**
 * Restore post
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Post.prototype.restore = function (query, fn) {
  var path = '/sites/' + this._sid + '/posts/' + this._id + '/restore';
  return request.put(this.wpcom, null, path, query, null, fn);
};

/**
 * Get post likes list
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Post.prototype.likesList = function (query, fn) {
  var path = '/sites/' + this._sid + '/posts/' + this._id + '/likes';
  return request.get(this.wpcom, null, path, query, fn);
};

/**
 * Search within a site for related posts
 *
 * @param {Object} [query]
 * @param {Object} body
 * @param {Function} fn
 * @api public
 */

Post.prototype.related = function (body, fn) {
  var path = '/sites/' + this._sid + '/posts/' + this._id + '/related';
  return request.put(this.wpcom, null, path, query, null, fn);
};

/**
 * Create a `Like` instance
 *
 * @api public
 */

Post.prototype.like = function () {
  return new Like(this._id, this._sid, this.wpcom);
};

/**
 * Create a `Reblog` instance
 *
 * @api public
 */

Post.prototype.reblog = function () {
  return new Reblog(this._id, this._sid, this.wpcom);
};

/**
 * Create a `Comment` instance
 *
 * @param {String} [cid] comment id
 * @api public
 */

Post.prototype.comment = function (cid) {
  return new Comment(cid, this._id, this._sid, this.wpcom);
};

/**
 * Return recent comments
 *
 * @param {Objecy} [query]
 * @param {String} id
 * @api public
 */

Post.prototype.comments = function (query, fn) {
  var comment = new Comment(null, this._id, this._sid, this.wpcom);
  comment.replies(query, fn);
  return comment;
};

/**
 * Expose `Post` module
 */

module.exports = Post;