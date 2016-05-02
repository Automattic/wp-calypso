var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
var root = '/plans';

var Plans = (function () {
	/**
  * `Plans` constructor.
  *
  * @param {WPCOM} wpcom - wpcom instance
  * @return {Undefined} undefined
  */

	function Plans(wpcom) {
		_classCallCheck(this, Plans);

		if (!(this instanceof Plans)) {
			return new Plans(wpcom);
		}
		this.wpcom = wpcom;
	}

	/**
  * Get a list of active WordPress.com plans
  *
  * @param {Object} [query] - query object parameter
  * @param {Function} [fn] - callback function
  * @return {Promise} Promise
  */

	_createClass(Plans, [{
		key: 'list',
		value: function list(query, fn) {
			return this.wpcom.req.get(root, query, fn);
		}

		/**
   * Get a list of features for active WordPress.com plans
   *
   * @param {Object} [query] - query object parameter
   * @param {Function} [fn] - callback function
   * @return {Promise} Promise
   */
	}, {
		key: 'features',
		value: function features(query, fn) {
			return this.wpcom.req.get(root + '/features', query, fn);
		}
	}]);

	return Plans;
})();

exports['default'] = Plans;
module.exports = exports['default'];