var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
/**
 * Module vars
 */
var root = '/sites';

var SiteDomain = (function () {
	/**
  * `SiteDomain` constructor.
  *
  * @param {Number|String} id - site identifier
  * @param {WPCOM} wpcom - wpcom instance
  * @return {Undefined} undefined
  */

	function SiteDomain(id, wpcom) {
		_classCallCheck(this, SiteDomain);

		if (!(this instanceof SiteDomain)) {
			return new SiteDomain(id, wpcom);
		}
		this._sid = id;
		this.path = root + '/' + this._sid + '/domains';
		this.wpcom = wpcom;
	}

	/**
  * Expose `SiteDomain` module
  */

	/**
  * Get the primary domain for a site
  *
  * @param {Object} [query] - query object parameter
  * @param {Function} [fn] - callback function
  * @return {Function} request handler
  */

	_createClass(SiteDomain, [{
		key: 'getPrimary',
		value: function getPrimary(query, fn) {
			return this.wpcom.req.get(this.path + '/primary', query, fn);
		}

		/**
   * Set the primary domain for a site
   *
   * @param {String} domain - domain to set
   * @param {Function} [fn] - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'setPrimary',
		value: function setPrimary(domain, fn) {
			return this.wpcom.req.put(this.path + '/primary', {}, { domain: domain }, fn);
		}

		/**
   * Get the redirect status for a site
   *
   * @param {Object} [query] - query object parameter
   * @param {Function} [fn] - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'getRedirect',
		value: function getRedirect(query, fn) {
			return this.wpcom.req.get(this.path + '/redirect', query, fn);
		}

		/**
   * Set the redirect location for a site
   *
   * @param {String|Object} location - location to set
   * @param {Function} [fn] - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'setRedirect',
		value: function setRedirect(location, fn) {
			if (typeof location === 'string') {
				location = { location: location };
			}

			return this.wpcom.req.put(this.path + '/redirect', {}, location, fn);
		}
	}]);

	return SiteDomain;
})();

exports['default'] = SiteDomain;
module.exports = exports['default'];