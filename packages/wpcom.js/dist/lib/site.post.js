var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
/**
 * Module dependencies.
 */

var _sitePostLike = require('./site.post.like');

var _sitePostLike2 = _interopRequireDefault(_sitePostLike);

var _sitePostReblog = require('./site.post.reblog');

var _sitePostReblog2 = _interopRequireDefault(_sitePostReblog);

var _siteComment = require('./site.comment');

var _siteComment2 = _interopRequireDefault(_siteComment);

var _sitePostSubscriber = require('./site.post.subscriber');

var _sitePostSubscriber2 = _interopRequireDefault(_sitePostSubscriber);

var _utilRuntimeBuilder = require('./util/runtime-builder');

var _utilRuntimeBuilder2 = _interopRequireDefault(_utilRuntimeBuilder);

var _runtimeSitePostGetJson = require('./runtime/site.post.get.json');

var _runtimeSitePostGetJson2 = _interopRequireDefault(_runtimeSitePostGetJson);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

/**
 * Module vars
 */
var debug = (0, _debug2['default'])('wpcom:post');
var root = '/sites';

/**
 * SitePost class
 */

var SitePost = (function () {
	/**
  * SitePost methods
  *
  * @param {String} id - post id
  * @param {String} sid site id
  * @param {WPCOM} wpcom - wpcom instance
  * @return {Null} null
  */

	function SitePost(id, sid, wpcom) {
		_classCallCheck(this, SitePost);

		if (!(this instanceof SitePost)) {
			return new SitePost(id, sid, wpcom);
		}

		this.wpcom = wpcom;
		this._sid = sid;
		this.path = root + '/' + this._sid + '/posts';

		// set `id` and/or `slug` properties
		id = id || {};
		if ('object' !== typeof id) {
			this._id = id;
		} else {
			this._id = id.id;
			this._slug = id.slug;
		}
	}

	// add methods in runtime

	/**
  * Set post `id`
  *
  * @param {String} id - site id
  */

	_createClass(SitePost, [{
		key: 'id',
		value: function id(_id) {
			this._id = _id;
		}

		/**
   * Set post `slug`
   *
   * @param {String} slug - site slug
   */
	}, {
		key: 'slug',
		value: function slug(_slug) {
			this._slug = _slug;
		}

		/**
   * Get post url path
   *
   * @return {String} post path
   */

	}, {
		key: 'getPostPath',
		value: function getPostPath() {
			return this.path + '/' + this._id;
		}

		/**
   * Get post
   *
   * @param {Object} [query] - query object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'get',
		value: function get(query, fn) {
			if (!this._id && this._slug) {
				return this.getBySlug(query, fn);
			}

			return this.wpcom.req.get(this.getPostPath(), query, fn);
		}

		/**
   * Get post by slug
   *
   * @param {Object} [query] - query object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'getBySlug',
		value: function getBySlug(query, fn) {
			return this.wpcom.req.get(this.path + '/slug:' + this._slug, query, fn);
		}

		/**
   * Add post
   *
   * @param {Object} [query] - query object parameter
   * @param {Object} body - body object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'add',
		value: function add(query, body, fn) {
			var _this = this;

			if (undefined === fn) {
				if (undefined === body) {
					body = query;
					query = {};
				} else if ('function' === typeof body) {
					fn = body;
					body = query;
					query = {};
				}
			}

			return this.wpcom.req.post(this.path + '/new', query, body).then(function (data) {
				// update POST object
				_this._id = data.ID;
				debug('Set post _id: %s', _this._id);

				_this._slug = data.slug;
				debug('Set post _slug: %s', _this._slug);

				if ('function' === typeof fn) {
					fn(null, data);
				} else {
					return _Promise.resolve(data);
				}
			})['catch'](function (err) {
				if ('function' === typeof fn) {
					fn(err);
				} else {
					return _Promise.reject(err);
				}
			});
		}

		/**
   * Edit post
   *
   * @param {Object} [query] - query object parameter
   * @param {Object} body - body object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'update',
		value: function update(query, body, fn) {
			return this.wpcom.req.put(this.getPostPath(), query, body, fn);
		}

		/**
   * Delete post
   *
   * @param {Object} [query] - query object parameter
   * @param {Function} fn - callback function
   * @return {Promise} Promise
   */
	}, {
		key: 'delete',
		value: function _delete(query, fn) {
			var path = this.getPostPath() + '/delete';
			return this.wpcom.req.del(path, query, fn);
		}

		/**
   * Restore post
   *
   * @param {Object} [query] - query object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'restore',
		value: function restore(query, fn) {
			return this.wpcom.req.put(this.getPostPath() + '/restore', query, null, fn);
		}

		/**
   * Search within a site for related posts
   *
   * @param {Object} body - body object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'related',
		value: function related(body, fn) {
			return this.wpcom.req.put(this.getPostPath() + '/related', body, null, fn);
		}

		/**
   * Create a `Comment` instance
   *
   * @param {String} [cid] - comment id
   * @return {Comment} Comment instance
   */
	}, {
		key: 'comment',
		value: function comment(cid) {
			return new _siteComment2['default'](cid, this._id, this._sid, this.wpcom);
		}

		/**
   * Return recent comments
   *
   * @param {Object} [query] - query object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'comments',
		value: function comments(query, fn) {
			var comment = new _siteComment2['default'](null, this._id, this._sid, this.wpcom);
			return comment.replies(query, fn);
		}

		/**
   * Create a `Like` instance
   *
   * @return {Like} Like instance
   */
	}, {
		key: 'like',
		value: function like() {
			return new _sitePostLike2['default'](this._id, this._sid, this.wpcom);
		}

		/**
   * Create a `Reblog` instance
   *
   * @return {Reblog} Reblog instance
   */
	}, {
		key: 'reblog',
		value: function reblog() {
			return new _sitePostReblog2['default'](this._id, this._sid, this.wpcom);
		}

		/**
   * Return a `Subscriber` instance.
   *
   * *Example:*
   *    // Create a Subscriber instance of a post
   *    var post = wpcom.site( 'en.blog.wordpress.com' ).post( 1234 );
   *    var subs = post.subscriber();
   *
   * @return {Subscriber} Subscriber instance
   */
	}, {
		key: 'subscriber',
		value: function subscriber() {
			return new _sitePostSubscriber2['default'](this._id, this._sid, this.wpcom);
		}
	}]);

	return SitePost;
})();

(0, _utilRuntimeBuilder2['default'])(SitePost, _runtimeSitePostGetJson2['default'], function (item, ctx) {
	return '/sites/' + ctx._sid + '/posts/' + ctx._id + '/' + item.subpath;
});

exports['default'] = SitePost;
module.exports = exports['default'];