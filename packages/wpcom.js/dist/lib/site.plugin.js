var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
/**
 * Module vars
 */
var root = '/sites';

var SitePlugin = (function () {

	/**
  * `SitePlugin` constructor.
  *
  * @param {String} [slug] - the plugin slug
  * @param {Number|String} sid - site identifier
  * @param {WPCOM} wpcom - wpcom instance
  * @return {Undefined} undefined
  */

	function SitePlugin(slug, sid, wpcom) {
		_classCallCheck(this, SitePlugin);

		if (!(this instanceof SitePlugin)) {
			return new SitePlugin(slug, sid, wpcom);
		}

		if (!slug) {
			throw new Error('`slug` is not correctly defined');
		}

		this._slug = encodeURIComponent(slug);
		this._sid = sid;
		this.wpcom = wpcom;

		var path = root + '/' + this._sid + '/plugins';
		this.pluginPath = path + '/' + this._slug;
	}

	/**
  * Expose `SitePlugin` module
  */

	/**
  * Get informtion about the plugin
  *
  * @param {Object} [query] - query object parameter
  * @param {Function} [fn] - callback function
  * @return {Promise} Promise
  */

	_createClass(SitePlugin, [{
		key: 'get',
		value: function get(query, fn) {
			return this.wpcom.req.get(this.pluginPath, query, fn);
		}

		/**
   * config the plugin
   *
   * @param {Object} [query] - query object parameter
   * @param {Object} config - plugin config object
   * @param {Function} [fn] - callback function
   * @return {Promise} Promise
   */
	}, {
		key: 'config',
		value: function config(query, _config, fn) {
			return this.wpcom.req.put(this.pluginPath, query, _config, fn);
		}
	}, {
		key: 'update',

		/**
   * Update the plugin
   *
   * @param {Object} [query] - query object parameter
   * @param {Function} [fn] - callback function
   * @return {Promise} Promise
   */
		value: function update(query, fn) {
			return this.wpcom.req.put(this.pluginPath + '/update', query, fn);
		}
	}, {
		key: 'install',

		/**
   * Install the plugin
   *
   * @param {Object} [query] - query object parameter
   * @param {Function} [fn] - callback function
   * @return {Promise} Promise
   */
		value: function install(query, fn) {
			return this.wpcom.req.put(this.pluginPath + '/install', query, fn);
		}
	}, {
		key: 'delete',

		/**
   * Delete the plugin
   *
   * @param {Object} [query] - query object parameter
   * @param {Function} [fn] - callback function
   * @return {Promise} Promise
   */
		value: function _delete(query, fn) {
			return this.wpcom.req.put(this.pluginPath + '/delete', query, fn);
		}
	}, {
		key: 'activate',

		/**
   * Activate the plugin
   * This method is a shorthand of config()
   *
   * @param {Object} [query] - query object parameter
   * @param {Function} [fn] - callback function
   * @return {Promise} Promise
   */
		value: function activate(query, fn) {
			return this.config(query, { active: true }, fn);
		}
	}, {
		key: 'deactivate',

		/**
   * Deactivate the plugin
   * This method is a shorthand of config()
   *
   * @param {Object} [query] - query object parameter
   * @param {Function} [fn] - callback function
   * @return {Promise} Promise
   */
		value: function deactivate(query, fn) {
			return this.config(query, { active: false }, fn);
		}

		/**
   * Enable plugin autoupdate
   * This method is a shorthand of config()
   *
   * @param {Object} [query] - query object parameter
   * @param {Function} [fn] - callback function
   * @return {Promise} Promise
   */
	}, {
		key: 'enableAutoupdate',
		value: function enableAutoupdate(query, fn) {
			return this.config(query, { autoupdate: true }, fn);
		}

		/**
   * Disable plugin autoupdate
   * This method is a shorthand of config()
   *
   * @param {Object} [query] - query object parameter
   * @param {Function} [fn] - callback function
   * @return {Promise} Promise
   */
	}, {
		key: 'disableAutoupdate',
		value: function disableAutoupdate(query, fn) {
			return this.config(query, { autoupdate: false }, fn);
		}
	}]);

	return SitePlugin;
})();

exports['default'] = SitePlugin;
module.exports = exports['default'];