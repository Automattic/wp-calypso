
/**
 * Module dependencies.
 */

var Post = require('./post');
var Category = require('./category');
var Tag = require('./tag');
var Media = require('./media');
var Comment = require('./comment');
var Follow = require('./follow');
var request = require('./util/request');
var debug = require('debug')('wpcom:site');

/**
 * Resources array
 * A list of endpoints with the same structure
 */

var resources = [
  'categories',
  'comments',
  'follows',
  'media',
  'posts',
  [ 'stats', 'stats' ],
  [ 'statsVisits', 'stats/visits' ],
  [ 'statsReferrers', 'stats/referrers' ],
  [ 'statsTopPosts', 'stats/top-posts' ],
  [ 'statsCountryViews', 'stats/country-views' ],
  [ 'statsClicks', 'stats/clicks' ],
  [ 'statsSearchTerms', 'stats/search-terms' ],
  'tags',
  'users'
];

/**
 * Create a Site instance
 *
 * @param {WPCOM} wpcom
 * @api public
 */

function Site(id, wpcom) {
  if (!(this instanceof Site)) {
    return new Site(id, wpcom);
  }

  this.wpcom = wpcom;

  debug('set %o site id', id);
  this._id = encodeURIComponent(id);
}

/**
 * Require site information
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @api public
 */

Site.prototype.get = function (query, fn) {
  return request.get(this.wpcom, null, '/sites/' + this._id, query, fn);
};

/**
 * List method builder
 *
 * @param {String} subpath
 * @param {Function}
 * @api private
 */

var list = function (subpath, apiVersion) {

  /**
   * Return the <names>List method
   *
   * @param {Object} [query]
   * @param {Function} fn
   * @api public
   */

  return function (query, fn) {
    var path = '/sites/' + this._id + '/' + subpath;
    return request.get(this.wpcom, { apiVersion: apiVersion }, path, query, fn);
  };
};

// walk for each resource and create related method
var i, res, isarr, name, subpath, apiVersion;
for (i = 0; i < resources.length; i++) {
  res = resources[i];
  isarr = Array.isArray(res);

  name =  isarr ? res[0] : res + 'List';
  subpath = isarr ? res[1] : res;
  apiVersion = isarr && 'string' === typeof res[2] ? res[2] : '1';

  debug('adding %o method in %o sub-path (v%o)', 'site.' + name + '()', subpath, apiVersion);
  Site.prototype[name] = list(subpath, apiVersion);
}

/**
 * :POST:
 * Create a `Post` instance
 *
 * @param {String} id
 * @api public
 */

Site.prototype.post = function (id) {
  return new Post(id, this._id, this.wpcom);
};

/**
 * :POST:
 * Add a new blog post
 *
 * @param {Object} body
 * @param {Function} fn
 * @return {Post} new Post instance
 */

Site.prototype.addPost = function (body, fn) {
  var post = new Post(null, this._id, this.wpcom);
  return post.add(body, fn);
};

/**
 * :POST:
 * Delete a blog post
 *
 * @param {String} id
 * @param {Function} fn
 * @return {Post} remove Post instance
 */

Site.prototype.deletePost = function (id, fn) {
  var post = new Post(id, this._id, this.wpcom);
  return post.delete(fn);
};

/**
 * Create a `Media` instance
 *
 * @param {String} id
 * @api public
 */

Site.prototype.media = function (id) {
  return new Media(id, this._id, this.wpcom);
};

/**
 * Add a media from a file
 *
 * @param {Object} [query]
 * @param {Array|String} files
 * @param {Function} fn
 * @return {Post} new Post instance
 */

Site.prototype.addMediaFiles = function (query, files, fn) {
  var media = new Media(null, this._id, this.wpcom);
  return media.addFiles(query, files, fn);
};

/**
 * Add a new media from url
 *
 * @param {Object} [query]
 * @param {Array|String} files
 * @param {Function} fn
 * @return {Post} new Post instance
 */

Site.prototype.addMediaUrls = function (query, files, fn) {
  var media = new Media(null, this._id, this.wpcom);
  return media.addUrls(query, files, fn);
};

/**
 * Delete a blog media
 *
 * @param {String} id
 * @param {Function} fn
 * @return {Post} removed Media instance
 */

Site.prototype.deleteMedia = function (id, fn) {
  var media = new Media(id, this._id, this.wpcom);
  return media.del(fn);
};

/**
 * Create a `Comment` instance
 *
 * @param {String} id
 * @api public
 */

Site.prototype.comment = function (id) {
  return new Comment(id, null, this._id, this.wpcom);
};

/**
 * Create a `Follow` instance
 *
 * @api public
 */

Site.prototype.follow = function () {
  return new Follow(this._id, this.wpcom);
};

/**
 * Create a `Category` instance
 * Set `cat` alias
 *
 * @param {String} [slug]
 * @api public
 */

Site.prototype.cat = Site.prototype.category = function (slug) {
  return new Category(slug, this._id, this.wpcom);
};

/**
 * Create a `Tag` instance
 *
 * @param {String} [slug]
 * @api public
 */

Site.prototype.tag = function (slug) {
  return new Tag(slug, this._id, this.wpcom);
};

/**
 * Expose `Site` module
 */

module.exports = Site;
