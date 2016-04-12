var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
/**
 * Module dependencies.
 */

var _siteTaxonomyTerm = require('./site.taxonomy.term');

var _siteTaxonomyTerm2 = _interopRequireDefault(_siteTaxonomyTerm);

/**
 * SiteTaxonomy class
 */

var SiteTaxonomy = (function () {
	/**
  * Create a SiteTaxonomy instance
  *
  * @param {String} taxonomy - taxonomy type
  * @param {String} siteId - site id
  * @param {WPCOM} wpcom - wpcom instance
  * @return {Null} null
  */

	function SiteTaxonomy(taxonomy, siteId, wpcom) {
		_classCallCheck(this, SiteTaxonomy);

		if (!siteId) {
			throw new Error('`siteId` is not correctly defined');
		}

		if (!taxonomy) {
			throw new Error('`taxonomy` is not correctly defined');
		}

		if (!(this instanceof SiteTaxonomy)) {
			return new SiteTaxonomy(taxonomy, siteId, wpcom);
		}

		this.wpcom = wpcom;

		this._siteId = encodeURIComponent(siteId);
		this._taxonomy = encodeURIComponent(taxonomy);
		this._rootPath = '/sites/' + this._siteId + '/taxonomies/' + this._taxonomy;
	}

	/**
  * Get a list of Terms for the Taxonomy
  *
  * @param {Object} [query] - query object
 	 * @param {Function} fn - callback function
 	 * @return {Promise} Promise
 	 */

	_createClass(SiteTaxonomy, [{
		key: 'termsList',
		value: function termsList(query, fn) {
			var termsPath = this._rootPath + '/terms';
			return this.wpcom.req.get(termsPath, query, fn);
		}

		/**
   * Return `Term` instance
   *
   * @param {String} [term] - term slug
   * @return {Term} Term instance
   */
	}, {
		key: 'term',
		value: function term(_term) {
			return new _siteTaxonomyTerm2['default'](_term, this._taxonomy, this._siteId, this.wpcom);
		}
	}]);

	return SiteTaxonomy;
})();

exports['default'] = SiteTaxonomy;
module.exports = exports['default'];