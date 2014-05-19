
/**
 * Module dependencies.
 */

var Post = require('./post');
var Media = require('./media');
var Comment = require('./comment');
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
 * List method builder
 *
 * @param {String} subpath
 * @param {Function}
 * @api private
 */

var list = function(subpath) {

  /**
   * Return the <names>List method
   *
   * @param {Object} [query]
   * @param {Function} fn
   * @api public
   */

  return function (query, fn){
    this.wpcom.sendRequest('/sites/' + this._id + '/' + subpath, query, null, fn);
  };
};

// walk for each resource and create related method
for (var i = 0; i < resources.length; i++) {
  var res = resources[i];
  var isarr = Array.isArray(res);

  var name =  isarr ? res[0] : res + 'List';
  var subpath = isarr ? res[1] : res;

  debug('adding `site.%s()` method in `%s` sub-path', name, subpath);
  Site.prototype[name] = list.call(this, subpath);
}

/**
 * :POST:
 * Create a `Post` instance
 *
 * @param {String} id
 * @api public
 */

Site.prototype.post = function(id){
  return Post(id, this._id, this.wpcom);
};

/**
 * :POST:
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
 * :POST:
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
 * :MEDIA:
 * Create a `Media` instance
 *
 * @param {String} id
 * @api public
 */

Site.prototype.media = function(id){
  return Media(id, this._id, this.wpcom);
};

/**
 * :MEDIA:
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
 * :MEDIA:
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
 * :MEDIA:
 * Delete a blog media
 *
 * @param {String} id
 * @param {Function} fn
 * @return {Post} removed Media instance
 */

Site.prototype.deleteMedia = function(id, fn){
  var media = Media(id, this._id, this.wpcom);
  media.del(fn);
  return media;
};

/**
 * :COMMENT:
 * Create a `Comment` instance
 *
 * @param {String} id
 * @api public
 */

Site.prototype.comment = function(id){
  return Comment(id, null, this._id, this.wpcom);
};

/**
 * Expose `Site` module
 */

module.exports = Site;
