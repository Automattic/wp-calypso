
/**
 * Module dependencies.
 */

var Post = require('./post');
var Category = require('./category');
var Tag = require('./tag');
var Media = require('./media');
var Comment = require('./comment');
var Follow = require('./follow');
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
  'shortcodes',
  'embeds',
  [ 'stats', 'stats' ],
  [ 'statsClicks', 'stats/clicks' ],
  [ 'statsComments', 'stats/comments' ],
  [ 'statsCommentFollowers', 'stats/comment-followers' ],
  [ 'statsCountryViews', 'stats/country-views' ],
  [ 'statsFollowers', 'stats/followers' ],
  [ 'statsPublicize', 'stats/publicize' ],
  [ 'statsReferrers', 'stats/referrers' ],
  [ 'statsSearchTerms', 'stats/search-terms' ],
  [ 'statsStreak', 'stats/streak' ],
  [ 'statsSummary', 'stats/summary' ],
  [ 'statsTags', 'stats/tags' ],
  [ 'statsTopAuthors', 'stats/top-authors' ],
  [ 'statsTopPosts', 'stats/top-posts' ],
  [ 'statsVideoPlays', 'stats/video-plays' ],
  [ 'statsVisits', 'stats/visits' ],
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
  return this.wpcom.req.get('/sites/' + this._id, query, fn);
};

/**
 * List method builder
 *
 * @param {String} subpath
 * @param {Function}
 * @api private
 */

function list(subpath) {

  /**
   * Return the <names>List method
   *
   * @param {Object} [query]
   * @param {Function} fn
   * @api public
   */

  return function (query, fn) {
    var path = '/sites/' + this._id + '/' + subpath;
    return this.wpcom.req.get(path, query, fn);
  };
}

// walk for each resource and create related method
var i, res, isarr, name, subpath;
for (i = 0; i < resources.length; i++) {
  res = resources[i];
  isarr = Array.isArray(res);

  name =  isarr ? res[0] : res + 'List';
  subpath = isarr ? res[1] : res;

  debug('adding method: %o - sub-path: %o - version: %s', ('site.' + name + '()'), subpath);
  Site.prototype[name] = list(subpath);
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
 * Get a rendered shortcode for a site.
 *
 * Note: The current user must have publishing access.
 *
 * @param {String} url
 * @param {Object} [query]
 * @api public
 */

Site.prototype.renderShortcode = function (url, query, fn) {
  if ('string' !== typeof url) {
    throw new TypeError('expected a url String');
  }

  if ('function' == typeof query) {
    fn = query;
    query = {};
  }

  query = query || {};
  query.shortcode = url;

  var path = '/sites/' + this._id + '/shortcodes/render';

  return this.wpcom.req.get(path, query, fn);
};

/**
 * Get a rendered embed for a site.
 *
 * Note: The current user must have publishing access.
 *
 * @param {String} url
 * @param {Object} [query]
 * @api public
 */

Site.prototype.renderEmbed = function (url, query, fn) {
  if ('string' !== typeof url) {
    throw new TypeError('expected an embed String');
  }

  if ('function' == typeof query) {
    fn = query;
    query = {};
  }

  query = query || {};
  query.embed_url = url;

  var path = '/sites/' + this._id + '/embeds/render';
  return this.wpcom.req.get(path, query, fn);
};

/**
 * Mark a referrering domain as spam
 *
 * @param {String} domain
 * @api public
 */

Site.prototype.statsReferrersSpamNew = function (domain, fn) {
  var path = '/sites/' + this._id + '/stats/referrers/spam/new';
  var body = { domain: domain };

  return this.wpcom.req.post(path, body, null, fn);
};

/**
 * Remove referrering domain from spam
 *
 * @param {String} domain
 * @api public
 */

Site.prototype.statsReferrersSpamDelete = function (domain, fn) {
  var path = '/sites/' + this._id + '/stats/referrers/spam/delete';
  var body = { domain: domain };

  return this.wpcom.req.post(path, body, null, fn);
};

/**
 * Get detailed stats about a VideoPress video
 *
 * @param {String} videoId
 * @api public
 */

Site.prototype.statsVideo = function (videoId, fn) {
  var path = '/sites/' + this._id + '/stats/video/' + videoId;

  return this.wpcom.req.get(path, fn);
};

/**
 * Get detailed stats about a particular post
 *
 * @param {String} postId
 * @api public
 */

Site.prototype.statsPostViews = function (postId, fn) {
  var path = '/sites/' + this._id + '/stats/post/' + postId;

  return this.wpcom.req.get(path, fn);
};

/**
 * Expose `Site` module
 */

module.exports = Site;