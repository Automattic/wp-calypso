var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
var root = '/domains/';

var DomainDns = (function () {
	/**
  * `DomainDns` constructor.
  *
  * @param {String} domainId - domain identifier
  * @param {WPCOM} wpcom - wpcom instance
  * @return {Undefined} undefined
  */

	function DomainDns(domainId, wpcom) {
		_classCallCheck(this, DomainDns);

		if (!(this instanceof DomainDns)) {
			return new DomainDns(domainId, wpcom);
		}

		this._domain = domainId;
		this._subpath = root + this._domain + '/dns';
		this.wpcom = wpcom;
	}

	/**
  * Expose `DomainDns` module
  */

	/**
  * Adds a DNS record
  *
  * @param {Object} record - record
  * @param {Object} [query] - query object parameter
  * @param {Function} fn - callback function
  * @return {Function} request handler
  */

	_createClass(DomainDns, [{
		key: 'add',
		value: function add(record, query, fn) {
			if ('function' === typeof query) {
				fn = query;
				query = {};
			}

			return this.wpcom.req.post(this._subpath + '/add', query, record, fn);
		}

		/**
   * Delete a DNS record
   *
   * @param {String} record - record
   * @param {Object} [query] - query object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'delete',
		value: function _delete(record, query, fn) {
			return this.wpcom.req.post(this._subpath + '/delete', query, record, fn);
		}
	}]);

	return DomainDns;
})();

exports['default'] = DomainDns;
module.exports = exports['default'];