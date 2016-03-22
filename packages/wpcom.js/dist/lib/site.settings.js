var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _defineProperty = require('babel-runtime/helpers/define-property')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
/**
 * SiteSettings methods
 *
 * @param {String} sid - site id
 * @param {WPCOM} wpcom - wpcom instance
 * @return {Null} null
 */

var SiteSettings = (function () {
	function SiteSettings(sid, wpcom) {
		_classCallCheck(this, SiteSettings);

		if (!sid) {
			throw new Error('`site id` is not correctly defined');
		}

		if (!(this instanceof SiteSettings)) {
			return new SiteSettings(sid, wpcom);
		}

		this.wpcom = wpcom;
		this._sid = sid;
		this.path = '/sites/' + this._sid + '/settings';
	}

	/**
  * Get site-settings
  *
  * @param {Object} [query] - query object parameter
  * @param {Function} fn - callback function
  * @return {Function} request handler
  */

	_createClass(SiteSettings, [{
		key: 'get',
		value: function get(query, fn) {
			return this.wpcom.req.get(this.path, query, fn);
		}

		/**
   * Get site-settings single option
   *
   * @param {String} option - option to ask
   * @param {Function} [fn] - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'getOption',
		value: function getOption(option) {
			var _this = this;

			var fn = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

			var query = { fields: 'settings' };
			return new _Promise(function (resolve, reject) {
				_this.wpcom.req.get(_this.path, query, function (err, data) {
					if (err) {
						fn(err);
						return reject(err);
					}

					if (!data) {
						fn();
						return resolve();
					}

					var settings = data.settings;

					if (settings && typeof settings[option] !== 'undefined') {
						fn(null, settings[option]);
						return resolve(settings[option]);
					}

					fn(null, data);
					return resolve(data);
				});
			});
		}

		/**
   * Update site-settings
   *
   * @param {Object} [query] - query object parameter
   * @param {Object} body - body object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'update',
		value: function update(query, body, fn) {
			return this.wpcom.req.put(this.path, query, body, fn);
		}

		/**
   * Set site-settings single option
   *
   * @param {String} option - option to set
   * @param {*} value - value to assing to the given option
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'setOption',
		value: function setOption(option, value, fn) {
			return this.wpcom.req.put(this.path, {}, _defineProperty({}, option, value), fn);
		}
	}]);

	return SiteSettings;
})();

exports['default'] = SiteSettings;
module.exports = exports['default'];