var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var root = '/me/connected-applications/';

var MeConnectedApp = (function () {

	/**
  * `MeConnectedApp` constructor.
  *
  * @param {String} appId - application identifier
  * @param {WPCOM} wpcom - wpcom instance
  * @return {Null} null
  */

	function MeConnectedApp(appId, wpcom) {
		_classCallCheck(this, MeConnectedApp);

		if (!(this instanceof MeConnectedApp)) {
			return new MeConnectedApp(appId, wpcom);
		}
		this._id = appId;
		this.wpcom = wpcom;
	}

	/**
 * Expose `MeConnectedApp` module
 */

	/**
  * Get one of current user's connected applications.
  *
  * @param {Object} [query] - query object parameter
  * @param {Function} fn - callback function
  * @return {Function} request handler
  */

	_createClass(MeConnectedApp, [{
		key: 'get',
		value: function get(query, fn) {
			return this.wpcom.req.get(root + this._id, query, fn);
		}

		/**
   * Delete the app of the  current user
   * through of the given appId
   *
   * @param {Object} [query] - query object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'delete',
		value: function _delete(query, fn) {
			return this.wpcom.req.del(root + this._id + '/delete', query, fn);
		}
	}]);

	return MeConnectedApp;
})();

module.exports = MeConnectedApp;