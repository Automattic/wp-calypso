var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var root = '/me/two-step/sms/';

var MeTwoStepSMS = (function () {

	/**
  * `MeTwoStepSMS` constructor.
  *
  * @param {WPCOM} wpcom - wpcom instance
  * @return {Null} null
  */

	function MeTwoStepSMS(wpcom) {
		_classCallCheck(this, MeTwoStepSMS);

		if (!(this instanceof MeTwoStepSMS)) {
			return new MeTwoStepSMS(wpcom);
		}
		this.wpcom = wpcom;
	}

	/**
 * Expose `MeTwoStepSMS` module
 */

	/**
  * Sends a two-step code via SMS to the current user.
  *
  * @param {Object} [query] - query object parameter
  * @param {Function} fn - callback function
  * @return {Function} request handler
  */

	_createClass(MeTwoStepSMS, [{
		key: 'send',
		value: function send(query, fn) {
			return this.wpcom.req.post(root + 'new', query, fn);
		}
	}]);

	return MeTwoStepSMS;
})();

module.exports = MeTwoStepSMS;