
/**
 * Module dependencies.
 */

var Post = require('./post');
var debug = require('debug')('wpcom:site');

/**
 * Create a Sites instance
 *
 * @param {WPCOM} wpcom
 * @api public
 */

function Sites(id, wpcom){
  if (!(this instanceof Sites)) return new Sites(id, wpcom);
  this.wpcom = wpcom;

  debug('set `%s` site id', id);
  this._id = id;
}

/**
 * Require site information
 *
 * @param {Object} [params]
 * @param {Function} fn
 * @api public
 */

Sites.prototype.get = function(params, fn){
  if (!this._id) {
    return fn(new Error('site `id` is not defined'));
  }

  this.wpcom.req.send('site.get', { site: this._id }, params, fn);
};

/**
 * Require posts site
 *
 * @param {Object} [params]
 * @param {Function} fn
 * @api public
 */

Sites.prototype.posts = function(params, fn){
  if (!this._id) {
    return fn(new Error('site `id` is not defined'));
  }

  this.wpcom.req.send('posts.get', { site: this._id }, params, fn);
};

/**
 * Create a `Post` instance
 *
 * @param {String} id
 * @api public
 */

Sites.prototype.post = function(id){
  return Post(id, this._id, this.wpcom);
};

/**
 * Add a new blog post
 *
 * @param {Object} data
 * @param {Function} fn
 * @return {Post} new Post instance
 */

Sites.prototype.addPost = function(data, fn){
  var post = Post(null, this._id, this.wpcom);
  post.add(data, fn);
  return post;
};

/**
 * Delete a blog post
 *
 * @param {String} id
 * @param {Function} fn
 * @return {Post} remove Post instance
 */

Sites.prototype.deletePost = function(id, fn){
  var post = Post(id, this._id, this.wpcom);
  post.delete(fn);
  return post;
};

/**
 * Expose `Sites` module
 */

module.exports = Sites;
