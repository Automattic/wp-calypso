var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

/**
 * SiteAdCreditVouchers methods
 *
 * @param {String} sid - site id
 * @param {WPCOM} wpcom - wpcom instance
 * @return {Null} null
 */

var SiteAdCreditVouchers = (function () {
	function SiteAdCreditVouchers(sid, wpcom) {
		_classCallCheck(this, SiteAdCreditVouchers);

		if (!sid) {
			throw new Error('`site id` is not correctly defined');
		}

		if (!(this instanceof SiteAdCreditVouchers)) {
			return new SiteAdCreditVouchers(sid, wpcom);
		}

		this.wpcom = wpcom;
		this._sid = sid;
		this.path = '/sites/' + this._sid + '/vouchers';
	}

	/**
  * Get site vouchers list
  *
  * @param {Object} [query] - query object parameter
  * @param {Function} fn - callback function
  * @return {Function} request handler
  */

	_createClass(SiteAdCreditVouchers, [{
		key: 'list',
		value: function list(query, fn) {
			if (query === undefined) query = {};

			query.apiNamespace = 'wpcom/v2';
			return this.wpcom.req.get(this.path, query, fn);
		}

		/**
   * Get site voucher
   *
   * @param {String} serviceType - service type
   * @param {Object} [query] - query object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'get',
		value: function get(serviceType, query, fn) {
			if (query === undefined) query = {};

			query.apiNamespace = 'wpcom/v2';
			return this.wpcom.req.get(this.path + '/' + serviceType, query, fn);
		}

		/**
   * Assign a new voucher to the site
   *
   * @param {String} serviceType - service type
   * @param {Object} [query] - query object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'assign',
		value: function assign(serviceType, query, fn) {
			if (query === undefined) query = {};

			query.apiNamespace = 'wpcom/v2';
			return this.wpcom.req.post(this.path + '/' + serviceType + '/assign', query, {}, fn);
		}
	}]);

	return SiteAdCreditVouchers;
})();

exports['default'] = SiteAdCreditVouchers;
module.exports = exports['default'];