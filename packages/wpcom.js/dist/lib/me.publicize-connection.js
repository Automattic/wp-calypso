var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var root = '/me/publicize-connections/';

var PublicizeConnection = (function () {
	/**
 * `PublicizeConnection` constructor.
 *
 * @param {String} connectionId - application identifier
 * @param {WPCOM} wpcom - wpcom instance
 * @return {Null} null
 */

	function PublicizeConnection(connectionId, wpcom) {
		_classCallCheck(this, PublicizeConnection);

		if (!(this instanceof PublicizeConnection)) {
			return new PublicizeConnection(connectionId, wpcom);
		}
		this._id = connectionId;
		this.wpcom = wpcom;
	}

	/**
 * Expose `PublicizeConnection` module
 */

	/**
  * Get a single publicize connection that the current user has set up.
  *
  * @param {Object} [query] - query object parameter
  * @param {Function} fn - callback function
  * @return {Function} request handler
  */

	_createClass(PublicizeConnection, [{
		key: 'get',
		value: function get(query, fn) {
			return this.wpcom.req.get(root + this._id, query, fn);
		}

		/**
   * Add a publicize connection belonging to the current user.
   *
   * @param {Object} [query] - query object parameter
   * @param {Object} body - body object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'add',
		value: function add(query, body, fn) {
			return this.wpcom.req.post(root + 'new', query, body, fn);
		}

		/**
   * Update a publicize connection belonging to the current user.
   *
   * @param {Object} [query] - query object parameter
   * @param {Object} body - body object parameter
   * @param {Function} fn - callback function
   * @return {Function} request handler
   */
	}, {
		key: 'update',
		value: function update(query, body, fn) {
			return this.wpcom.req.put(root + this._id, query, body, fn);
		}

		/**
  * Delete the app of the  current user
  * through of the given connectionId
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

	return PublicizeConnection;
})();

module.exports = PublicizeConnection;