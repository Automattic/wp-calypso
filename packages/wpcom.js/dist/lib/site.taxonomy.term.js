var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
/**
 * SiteTaxonomyTerm class
 */

var SiteTaxonomyTerm = (function () {
	/**
  * Create a SiteTaxonomyTerm instance
  *
  * @param {String} term - term slug
  * @param {String} taxonomy - taxonomy type
  * @param {String} siteId - site id
  * @param {WPCOM} wpcom - wpcom instance
  * @return {Null} null
  */

	function SiteTaxonomyTerm(term, taxonomy, siteId, wpcom) {
		_classCallCheck(this, SiteTaxonomyTerm);

		if (!siteId) {
			throw new TypeError('`siteId` is not correctly defined');
		}

		if (!taxonomy) {
			throw new TypeError('`taxonomy` is not correctly defined');
		}

		if (!(this instanceof SiteTaxonomyTerm)) {
			return new SiteTaxonomyTerm(term, taxonomy, siteId, wpcom);
		}

		this.wpcom = wpcom;

		this._siteId = encodeURIComponent(siteId);
		this._taxonomy = encodeURIComponent(taxonomy);
		this._term = encodeURIComponent(term);
		this._taxonomyPath = '/sites/' + this._siteId + '/taxonomies/' + this._taxonomy + '/terms';
	}

	/**
  * Get Term details
  *
  * @param {Object} [query] - query parameters
 	 * @param {Function} fn - callback function
 	 * @return {Promise} Promise
  */

	_createClass(SiteTaxonomyTerm, [{
		key: 'get',
		value: function get(query, fn) {
			if (!this._term) {
				throw new Error('`term` is not correctly defined');
			}

			if ('function' === typeof query) {
				fn = query;
				query = {};
			}

			var path = this._taxonomyPath + '/slug:' + this._term;

			return this.wpcom.req.get(path, query, fn);
		}

		/**
   * Add new Term
   *
   * @param {Object} [params] - term parameters
  	 * @param {Function} fn - callback function
  	 * @return {Promise} Promise
   */
	}, {
		key: 'add',
		value: function add(params, fn) {
			if (!params || !params.name) {
				throw new Error('`params.name` is not correctly defined');
			}

			var path = this._taxonomyPath + '/new';

			return this.wpcom.req.post(path, params, fn);
		}

		/**
   * Delete Term
   *
  	 * @param {Function} fn - callback function
  	 * @return {Promise} Promise
   */
	}, {
		key: 'delete',
		value: function _delete(fn) {
			if (!this._term) {
				throw new Error('`term` is not correctly defined');
			}

			var path = this._taxonomyPath + '/slug:' + this._term + '/delete';

			return this.wpcom.req.del(path, fn);
		}

		/**
   * Update Term
   *
   * @param {Object} [params] - term parameters
  	 * @param {Function} fn - callback function
  	 * @return {Promise} Promise
   */
	}, {
		key: 'update',
		value: function update(params, fn) {
			if (!this._term) {
				throw new Error('`term` is not correctly defined');
			}

			var path = this._taxonomyPath + '/slug:' + this._term;
			return this.wpcom.req.put(path, params, fn);
		}
	}]);

	return SiteTaxonomyTerm;
})();

exports['default'] = SiteTaxonomyTerm;
module.exports = exports['default'];