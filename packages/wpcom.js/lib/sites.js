
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
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Sites.prototype.get = function(query, fn){
  if (!this._id) {
    return fn(new Error('site `id` is not defined'));
  }

  var set = { site: this._id };
  this.wpcom.sendRequest('sites.get', set, { query: query }, fn);
};

/**
 * Require posts site
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Sites.prototype.posts = function(query, fn){
  if (!this._id) {
    return fn(new Error('site `id` is not defined'));
  }

  var set = { site: this._id };
  this.wpcom.sendRequest('sites.posts.get', set, { query: query }, fn);
};

/**
 * Require the media library
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Sites.prototype.medias = function(query, fn){
  if (!this._id) {
    return fn(new Error('site `id` is not defined'));
  }

  var set = { site: this._id };
  this.wpcom.sendRequest('sites.medias.get', set, { query: query }, fn);
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
 * @param {Object} body
 * @param {Function} fn
 * @return {Post} new Post instance
 */

Sites.prototype.addPost = function(body, fn){
  var post = Post(null, this._id, this.wpcom);
  post.add(body, fn);
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
 * Add a new blog media body
 *
 * @param {Object} body
 * @param {Function} fn
 * @return {Post} new Post instance
 */

Sites.prototype.addMedia = function(body, fn){
  var media = Media(null, this._id, this.wpcom);
  media.add(body, fn);
  return media;
};

/**
 * Expose `Sites` module
 */

module.exports = Sites;
