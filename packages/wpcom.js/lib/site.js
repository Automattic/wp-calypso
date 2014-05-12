/**
 * Module dependencies.
 */

var Post = require('./post');
var Media = require('./media');
var debug = require('debug')('wpcom:site');

/**
 * Create a Site instance
 *
 * @param {WPCOM} wpcom
 * @api public
 */

function Site(id, wpcom){
  if (!(this instanceof Site)) return new Site(id, wpcom);
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

Site.prototype.get = function(query, fn){
  this.wpcom.sendRequest('/sites/' + this._id, query, null, fn);
};

/**
 * Require site posts list
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Site.prototype.postsList = function(query, fn){
  this.wpcom.sendRequest('/sites/' + this._id + '/posts', query, null, fn);
};

/**
 * Require the site media list
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Site.prototype.mediaList = function(query, fn){
  this.wpcom.sendRequest('/sites/' + this._id + '/media', query, null, fn);
};

/**
 * List the users of a site
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Site.prototype.usersList = function(query, fn){
  this.wpcom.sendRequest('/sites/' + this._id + '/users', query, null, fn);
};

/**
 * Create a `Post` instance
 *
 * @param {String} id
 * @api public
 */

Site.prototype.post = function(id){
  return Post(id, this._id, this.wpcom);
};

/**
 * Add a new blog post
 *
 * @param {Object} body
 * @param {Function} fn
 * @return {Post} new Post instance
 */

Site.prototype.addPost = function(body, fn){
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

Site.prototype.deletePost = function(id, fn){
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

Site.prototype.media = function(id){
  return Media(id, this._id, this.wpcom);
};

/**
 * Add a media from a file
 *
 * @param {Array|String} files
 * @param {Function} fn
 * @return {Post} new Post instance
 */

Site.prototype.addMediaFiles = function(files, fn){
  var media = Media(null, this._id, this.wpcom);
  media.addFiles(files, fn);
  return media;
};

/**
 * Add a new media from url
 *
 * @param {Array|String} files
 * @param {Function} fn
 * @return {Post} new Post instance
 */

Site.prototype.addMediaUrls = function(files, fn){
  var media = Media(null, this._id, this.wpcom);
  media.addUrls(files, fn);
  return media;
};

/**
 * Expose `Site` module
 */

module.exports = Site;
