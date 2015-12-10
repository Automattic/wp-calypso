var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var root = '/me/keyring-connections/';

var KeyringConnection = (function () {

	/**
  * `KeyringConnection` constructor.
  *
  * @param {String} keyId - the connection ID to take action on.
  * @param {WPCOM} wpcom - wpcom instance
  * @return {Null} null
  */

	function KeyringConnection(keyId, wpcom) {
		_classCallCheck(this, KeyringConnection);

		if (!(this instanceof KeyringConnection)) {
			return new KeyringConnection(keyId, wpcom);
		}
		this._id = keyId;
		this.wpcom = wpcom;
	}

	/**
 * Expose `KeyringConnection` module
 */

	/**
  * Get a single Keyring connection that the current user has setup.
  *
  * @param {Object} [query] - query object parameter
  * @param {Function} fn - callback function
  * @return {Function} request handler
  */

	_createClass(KeyringConnection, [{
		key: 'get',
		value: function get(query, fn) {
			return this.wpcom.req.get(root + this._id, query, fn);
		}

		/**
   * Delete the Keyring connection (and associated token) with the
   * provided ID. Also deletes all associated publicize connections.
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

	return KeyringConnection;
})();

module.exports = KeyringConnection;