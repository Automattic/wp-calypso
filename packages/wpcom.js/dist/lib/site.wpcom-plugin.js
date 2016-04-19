var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
/**
 * Module vars
 */
var root = '/sites';

var SiteWPComPlugin = (function () {

	/**
  * `SiteWPComPlugin` constructor.
  *
  * @param {String} [slug] - the plugin slug
  * @param {Number|String} sid - site identifier
  * @param {WPCOM} wpcom - wpcom instance
  * @return {Undefined} undefined
  */

	function SiteWPComPlugin(slug, sid, wpcom) {
		_classCallCheck(this, SiteWPComPlugin);

		if (!(this instanceof SiteWPComPlugin)) {
			return new SiteWPComPlugin(slug, sid, wpcom);
		}

		if (!slug) {
			throw new Error('`slug` is not correctly defined');
		}

		this._slug = encodeURIComponent(slug);
		this._sid = sid;
		this.wpcom = wpcom;

		var path = root + '/' + this._sid + '/wpcom-plugins';
		this.pluginPath = path + '/' + this._slug;
	}

	/**
  * Expose `SiteWPComPlugin` module
  */

	/**
  * Update the plugin configuration
  *
  * @param {Object} [query] - query object parameter
  * @param {Object} body - plugin body object
  * @param {Function} [fn] - callback function
  * @return {Promise} Promise
  */

	_createClass(SiteWPComPlugin, [{
		key: 'update',
		value: function update(query, body, fn) {
			return this.wpcom.req.put(this.pluginPath, query, body, fn);
		}
	}, {
		key: 'activate',

		/**
   * Activate the plugin
   * This method is a shorthand of update()
   *
   * @param {Object} [query] - query object parameter
   * @param {Function} [fn] - callback function
   * @return {Promise} Promise
   */
		value: function activate(query, fn) {
			return this.update(query, { active: true }, fn);
		}
	}, {
		key: 'deactivate',

		/**
   * Deactivate the plugin
   * This method is a shorthand of update()
   *
   * @param {Object} [query] - query object parameter
   * @param {Function} [fn] - callback function
   * @return {Promise} Promise
   */
		value: function deactivate(query, fn) {
			return this.update(query, { active: false }, fn);
		}
	}]);

	return SiteWPComPlugin;
})();

exports['default'] = SiteWPComPlugin;
module.exports = exports['default'];