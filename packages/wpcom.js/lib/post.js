
/**
 * Module dependencies.
 */

var debug = require('debug')('wp-connect:action');

/**
 * Post methods
 *
 * @param {WPCONN} wpconn
 * @api public
 */

function Post(wpconn){
  this.wpconn = wpconn;
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
  var set = {
    site: this.wpconn.site._id,
    post_ID: id
  };

  this.wpconn.req.exec('post_get', set, params, fn);
};

/**
 * Get site post by the given `slug`
 *
 * @api public
 */

Post.prototype.getBySlug = function(slug, params, fn){
  var set = {
    site: this.wpconn.site._id,
    post_slug: slug
  };

  this.wpconn.req.exec('post_get_by_slug', set, params, fn);
};

/**
 * Add post
 *
 * @param {Object} data
 * @param {Function} fn
 * @api public
 */

Post.prototype.add = function(data, fn){
  // set endpoint
  var set = { site: this.wpconn.site._id };

  var params = {
    method: 'post',
    data: data
  };

  this.wpconn.req.exec('post_add', set, params, fn);
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
  var set = {
    site: this.wpconn.site._id,
    post_id: id
  };

  var params = {
    method: 'post',
    data: data
  };

  this.wpconn.req.exec('post_edit', set, params, fn);
};

/**
 * Expose `Post` module
 */

module.exports = Post;
