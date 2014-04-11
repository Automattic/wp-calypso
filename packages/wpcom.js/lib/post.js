
/**
 * Module dependencies.
 */

var debug = require('debug')('wpcom:action');

/**
 * Post methods
 *
 * @param {WPCOM} wpcom
 * @api public
 */

function Post(wpcom){
  this.wpcom = wpcom;
}

/**
 * Get site post by the given `id`
 *
 * @param {String} id
 * @param {Object} params (optional)
 * @param {Function} fn
 * @api public
 */

Post.prototype.get = function(id, params, fn){
  var set = { site: this.wpcom.site._id, post_ID: id };
  this.wpcom.req.send('post.get', set, params, fn);
};

/**
 * Get site post by the given `slug`
 *
 * @param {String} id
 * @param {Object} params (optional)
 * @param {Function} fn
 * @api public
 */

Post.prototype.getBySlug = function(slug, params, fn){
  var set = { site: this.wpcom.site._id, post_slug: slug };
  this.wpcom.req.send('post.get_by_slug', set, params, fn);
};

/**
 * Add post
 *
 * @param {Object} data
 * @param {Function} fn
 * @api public
 */

Post.prototype.add = function(data, fn){
  var set = { site: this.wpcom.site._id };
  this.wpcom.req.send('post.add', set, { data: data }, fn);
};

/**
 * Edit post
 *
 * @param {String} id
 * @param {Object} data
 * @param {Function} fn
 * @api public
 */

Post.prototype.edit = function(id, data, fn){
  var set = { site: this.wpcom.site._id, post_id: id };
  this.wpcom.req.send('post.edit', set, { data: data }, fn);
};

/**
 * Delete post
 *
 * @param {String} id
 * @param {Function} fn
 * @api public
 */

Post.prototype.del = function(id, fn){
  var set = { site: this.wpcom.site._id, post_id: id };
  this.wpcom.req.send('post.delete', set, fn);
};

/**
 * Expose `Post` module
 */

module.exports = Post;
