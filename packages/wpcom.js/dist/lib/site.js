var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
/**
 * Module dependencies.
 */

var _sitePost = require('./site.post');

var _sitePost2 = _interopRequireDefault(_sitePost);

var _siteCategory = require('./site.category');

var _siteCategory2 = _interopRequireDefault(_siteCategory);

var _siteTag = require('./site.tag');

var _siteTag2 = _interopRequireDefault(_siteTag);

var _siteMedia = require('./site.media');

var _siteMedia2 = _interopRequireDefault(_siteMedia);

var _siteComment = require('./site.comment');

var _siteComment2 = _interopRequireDefault(_siteComment);

var _siteWordads = require('./site.wordads');

var _siteWordads2 = _interopRequireDefault(_siteWordads);

var _siteFollow = require('./site.follow');

var _siteFollow2 = _interopRequireDefault(_siteFollow);

var _sitePlugin = require('./site.plugin');

var _sitePlugin2 = _interopRequireDefault(_sitePlugin);

var _siteDomain = require('./site.domain');

var _siteDomain2 = _interopRequireDefault(_siteDomain);

var _siteSettings = require('./site.settings');

var _siteSettings2 = _interopRequireDefault(_siteSettings);

var _utilRuntimeBuilder = require('./util/runtime-builder');

var _utilRuntimeBuilder2 = _interopRequireDefault(_utilRuntimeBuilder);

var _runtimeSiteGetJson = require('./runtime/site.get.json');

var _runtimeSiteGetJson2 = _interopRequireDefault(_runtimeSiteGetJson);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

/**
 * Module vars
 */
var debug = (0, _debug2['default'])('wpcom:site');
var root = '/sites';

/**
 * Site class
 */

var Site = (function () {
	/**
  * Create a Site instance
  *
  * @param {String} id - site id
  * @param {WPCOM} wpcom - wpcom instance
  * @return {Null} null
  */

	function Site(id, wpcom) {
		_classCallCheck(this, Site);

		if (!(this instanceof Site)) {
			return new Site(id, wpcom);
		}

		this.wpcom = wpcom;

		debug('set %o site id', id);
		this._id = encodeURIComponent(id);
		this.path = root + '/' + this._id;
	}

	// add methods in runtime

	/**
  * Require site information
  *
  * @param {Object} [query] - query object parameter
  * @param {Function} fn - callback function
  * @return {Function} request handler
  */

	_createClass(Site, [{
		key: 'get',
		value: function get(query, fn) {
			return this.wpcom.req.get(this.path, query, fn);
		}

		/**
   * Create a `Post` instance
   *
   * @param {String} id - post id
   * @return {Post} Post instance
   */
	}, {
		key: 'post',
		value: function post(id) {
			return new _sitePost2['default'](id, this._id, this.wpcom);
		}

		/**
   * Add a new blog post
   *
   * @param {Object} body - body object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'addPost',
		value: function addPost(body, fn) {
			var post = new _sitePost2['default'](null, this._id, this.wpcom);
			return post.add(body, fn);
		}

		/**
   * Delete a blog post
   *
   * @param {String} id - post id
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'deletePost',
		value: function deletePost(id, fn) {
			var post = new _sitePost2['default'](id, this._id, this.wpcom);
			return post['delete'](fn);
		}

		/**
   * Create a `Media` instance
   *
   * @param {String} id - post id
   * @return {Media} Media instance
   */
	}, {
		key: 'media',
		value: function media(id) {
			return new _siteMedia2['default'](id, this._id, this.wpcom);
		}

		/**
   * Add a media from a file
   *
   * @param {Object} [query] - query object parameter
   * @param {Array|String} files - media files to add
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'addMediaFiles',
		value: function addMediaFiles(query, files, fn) {
			var media = new _siteMedia2['default'](null, this._id, this.wpcom);
			return media.addFiles(query, files, fn);
		}

		/**
   * Add a new media from url
   *
   * @param {Object} [query] - query object parameter
   * @param {Array|String} files - media files to add
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'addMediaUrls',
		value: function addMediaUrls(query, files, fn) {
			var media = new _siteMedia2['default'](null, this._id, this.wpcom);
			return media.addUrls(query, files, fn);
		}

		/**
   * Delete a blog media
   *
   * @param {String} id - media id
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'deleteMedia',
		value: function deleteMedia(id, fn) {
			var media = new _siteMedia2['default'](id, this._id, this.wpcom);
			return media.del(fn);
		}

		/**
   * Create a `Comment` instance
   *
   * @param {String} id - comment id
   * @return {Comment} Comment instance
   */
	}, {
		key: 'comment',
		value: function comment(id) {
			return new _siteComment2['default'](id, null, this._id, this.wpcom);
		}

		/**
   * Create a `Follow` instance
   *
   * @return {Follow} Follow instance
   */
	}, {
		key: 'follow',
		value: function follow() {
			return new _siteFollow2['default'](this._id, this.wpcom);
		}

		/**
   * Create a `SitePlugin` instance
   *
   * @param {String} id - plugin identifier
   * @return {SitePlugin} SitePlugin instance
   */
	}, {
		key: 'plugin',
		value: function plugin(id) {
			return new _sitePlugin2['default'](id, this._id, this.wpcom);
		}

		/**
   * Create a `Category` instance
   * Set `cat` alias
   *
   * @param {String} [slug] - category slug
   * @return {Category} Category instance
   */
	}, {
		key: 'category',
		value: function category(slug) {
			return new _siteCategory2['default'](slug, this._id, this.wpcom);
		}

		/**
   * Create a `Tag` instance
   *
   * @param {String} [slug] - tag slug
   * @return {Tag} Tag instance
   */
	}, {
		key: 'tag',
		value: function tag(slug) {
			return new _siteTag2['default'](slug, this._id, this.wpcom);
		}

		/**
   * Create a `SiteSettings` instance
   *
   * @return {SiteSettings} SiteSettings instance
   */
	}, {
		key: 'settings',
		value: function settings() {
			return new _siteSettings2['default'](this._id, this.wpcom);
		}

		/**
   * Create a `SiteDomain` instance
   *
   * @return {SiteDomain} SiteDomain instance
   */
	}, {
		key: 'domain',
		value: function domain() {
			return new _siteDomain2['default'](this._id, this.wpcom);
		}

		/**
   * Get number of posts in the post type groups by post status
   *
   * *Example:*
   *   // Get number post of pages
   *    wpcom
   *    .site( 'my-blog.wordpress.com' )
   *    .postCounts( 'page', function( err, data ) {
   *      // `counts` data object
   *    } );
   *
   * @param {String} type - post type
   * @param {Object} [query] - query object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'postCounts',
		value: function postCounts(type, query, fn) {
			if (type === undefined) type = 'post';

			if ('function' === typeof query) {
				fn = query;
				query = {};
			}

			return this.wpcom.req.get(this.path + '/post-counts/' + type, query, fn);
		}

		/**
   * Get a rendered shortcode for a site.
   *
   * Note: The current user must have publishing access.
   *
   * @param {String} url - shortcode url
   * @param {Object} [query] - query object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'renderShortcode',
		value: function renderShortcode(url, query, fn) {
			if ('string' !== typeof url) {
				throw new TypeError('expected a url String');
			}

			if ('function' === typeof query) {
				fn = query;
				query = {};
			}

			query = query || {};
			query.shortcode = url;

			return this.wpcom.req.get(this.path + '/shortcodes/render', query, fn);
		}

		/**
   * Get a rendered embed for a site.
   *
   * Note: The current user must have publishing access.
   *
   * @param {String} url - embed url
   * @param {Object} [query] - query object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'renderEmbed',
		value: function renderEmbed(url, query, fn) {
			if ('string' !== typeof url) {
				throw new TypeError('expected an embed String');
			}

			if ('function' === typeof query) {
				fn = query;
				query = {};
			}

			query = query || {};
			query.embed_url = url;

			return this.wpcom.req.get(this.path + '/embeds/render', query, fn);
		}

		/**
   * Mark a referrering domain as spam
   *
   * @param {String} domain - domain
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'statsReferrersSpamNew',
		value: function statsReferrersSpamNew(domain, fn) {
			var path = this.path + '/stats/referrers/spam/new';
			return this.wpcom.req.post(path, { domain: domain }, null, fn);
		}

		/**
   * Remove referrering domain from spam
   *
   * @param {String} domain - domain
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'statsReferrersSpamDelete',
		value: function statsReferrersSpamDelete(domain, fn) {
			var path = this.path + '/stats/referrers/spam/delete';
			return this.wpcom.req.post(path, { domain: domain }, null, fn);
		}

		/**
   * Get detailed stats about a VideoPress video
   *
   * @param {String} videoId - video id
   * @param {Object} [query] - query object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'statsVideo',
		value: function statsVideo(videoId, query, fn) {
			var path = this.path + '/stats/video/' + videoId;

			if ('function' === typeof query) {
				fn = query;
				query = {};
			}

			return this.wpcom.req.get(path, query, fn);
		}

		/**
   * Get detailed stats about a particular post
   *
   * @param {String} postId - post id
   * @param {Object} [query] - query object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'statsPostViews',
		value: function statsPostViews(postId, query, fn) {
			var path = this.path + '/stats/post/' + postId;

			if ('function' === typeof query) {
				fn = query;
				query = {};
			}

			return this.wpcom.req.get(path, query, fn);
		}

		/**
   * Return a `SiteWordAds` instance.
   *
   * *Example:*
   *    // Create a SiteWordAds instance
   *
   *    var wordAds = wpcom
   *      .site( 'my-blog.wordpress.com' )
   *      .wordAds();
   *
   * @return {SiteWordAds} SiteWordAds instance
   */
	}, {
		key: 'wordAds',
		value: function wordAds() {
			return new _siteWordads2['default'](this._id, this.wpcom);
		}
	}]);

	return Site;
})();

(0, _utilRuntimeBuilder2['default'])(Site, _runtimeSiteGetJson2['default'], function (methodParams, ctx) {
	return '/sites/' + ctx._id + '/' + methodParams.subpath;
});

exports['default'] = Site;
module.exports = exports['default'];