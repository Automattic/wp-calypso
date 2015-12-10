var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var root = '/me/settings/password/';

var MeSettingsPassword = (function () {

	/**
  * `MeSettingsPassword` constructor.
  *
  * @param {WPCOM} wpcom - wpcom instance
  * @return {Null} null
  */

	function MeSettingsPassword(wpcom) {
		_classCallCheck(this, MeSettingsPassword);

		if (!(this instanceof MeSettingsPassword)) {
			return new MeSettingsPassword(wpcom);
		}
		this.wpcom = wpcom;
	}

	/**
 * Expose `MeSettingsPassword` module
 */

	/**
  * Verify strength of a user's new password.
  *
  * @param {String} password - the users's potential new password
  * @param {Object} [query] - query object parameter
  * @param {Function} fn - callback function
  * @return {Function} request handler
  */

	_createClass(MeSettingsPassword, [{
		key: 'validate',
		value: function validate(password, query, fn) {
			return this.wpcom.req.post(root + 'validate', query, { password: password }, fn);
		}
	}]);

	return MeSettingsPassword;
})();

module.exports = MeSettingsPassword;