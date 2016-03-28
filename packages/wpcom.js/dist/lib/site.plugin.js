var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
/**
 * Module variables
 */
var root = '/sites';

var SitePlugin = (function () {
	/**
  * `SitePlugin` constructor.
  *
  * @param {String} [id] - the plugin ID
  * @param {Number|String} sid - site identifier
  * @param {WPCOM} wpcom - wpcom instance
  * @return {Undefined} undefined
  */

	function SitePlugin(id, sid, wpcom) {
		_classCallCheck(this, SitePlugin);

		if (!(this instanceof SitePlugin)) {
			return new SitePlugin(id, sid, wpcom);
		}

		this._id = id;
		this._sid = sid;
		this.path = root + '/' + this._sid + '/plugins';
		this.wpcom = wpcom;
	}

	/**
  * Expose `SitePlugin` module
  */

	/**
  * Get informtion about the plugin
  *
  * @param {Object} [query] - query object parameter
  * @param {Function} [fn] - callback function
  * @return {Function} request handler
  */

	_createClass(SitePlugin, [{
		key: 'get',
		value: function get(query, fn) {
			return this.wpcom.req.get(this.path + '/' + this._id, query, fn);
		}
	}]);

	return SitePlugin;
})();

exports['default'] = SitePlugin;
module.exports = exports['default'];