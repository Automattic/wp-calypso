
/**
 * Module dependencies.
 */

var Post = require('./post');
var Media = require('./media');
var debug = require('debug')('wpcom:sites');

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

  this.wpcom.req.send('sites.get', { site: this._id }, params, fn);
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

  this.wpcom.req.send('sites.posts.get', { site: this._id }, params, fn);
};

/**
 * Require the media library
 *
 * @param {Object} [params]
 * @param {Function} fn
 * @api public
 */

Sites.prototype.medias = function(params, fn){
  if (!this._id) {
    return fn(new Error('site `id` is not defined'));
  }

  this.wpcom.req.send('sites.media.get', { site: this._id }, params, fn);
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
 * Create a `Media` instance
 *
 * @param {String} id
 * @api public
 */

Sites.prototype.media = function(id){
  return Media(id, this._id, this.wpcom);
};

/**
 * Add a new blog media data
 *
 * @param {Object} data
 * @param {Function} fn
 * @return {Post} new Post instance
 */

Sites.prototype.addMedia = function(data, fn){
  var media = Media(null, this._id, this.wpcom);
  media.add(data, fn);
  return media;
};

/**
 * Expose `Sites` module
 */

module.exports = Sites;
