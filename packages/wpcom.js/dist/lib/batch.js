var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var Batch = (function () {
	/**
  * Create a `Batch` instance
  *
  * @param {WPCOM} wpcom - wpcom instance
  * @return {null} null
  * @api public
  */

	function Batch(wpcom) {
		_classCallCheck(this, Batch);

		if (!(this instanceof Batch)) {
			return new Batch(wpcom);
		}

		this.wpcom = wpcom;
		this.urls = [];
	}

	/**
  * Add url to batch requests
  *
  * @param {String} url - endpoint url
  * @return {Batch} batch instance
  * @api public
  */

	_createClass(Batch, [{
		key: 'add',
		value: function add(url) {
			this.urls.push(url);
			return this;
		}

		/**
   * Run the batch request
   *
   * @param {Object} [query] - optional query parameter
   * @param {Function} fn - callback
   * @return {Promise} Promise
   * @api public
   */
	}, {
		key: 'run',
		value: function run(query, fn) {
			if (query === undefined) query = {};

			if ('function' === typeof query) {
				fn = query;
				query = {};
			}

			// add urls to query object
			query.urls = this.urls;

			return this.wpcom.req.get('/batch', query, fn);
		}
	}]);

	return Batch;
})();

;

/**
 * Expose `Batch` module
 */
exports['default'] = Batch;
module.exports = exports['default'];