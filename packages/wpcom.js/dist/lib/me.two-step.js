var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

/**
 * Module dependencies
 */

var _meTwoStepSms = require('./me.two-step.sms');

var _meTwoStepSms2 = _interopRequireDefault(_meTwoStepSms);

var root = '/me/two-step/';

var MeTwoStep = (function () {

	/**
  * `MeTwoStep` constructor.
  *
  * @param {WPCOM} wpcom - wpcom instance
  * @return {Null} null
  */

	function MeTwoStep(wpcom) {
		_classCallCheck(this, MeTwoStep);

		if (!(this instanceof MeTwoStep)) {
			return new MeTwoStep(wpcom);
		}
		this.wpcom = wpcom;
	}

	/**
 * Expose `MeTwoStep` module
 */

	/**
  * Get information about current user's two factor configuration.
  *
  * @param {Object} [query] - query object parameter
  * @param {Function} fn - callback function
  * @return {Function} request handler
  */

	_createClass(MeTwoStep, [{
		key: 'get',
		value: function get(query, fn) {
			return this.wpcom.req.get(root, query, fn);
		}

		/**
   * Return a `MeTwoStepSMS` instance.
   *
   * @return {MeTwoStepSMS} MeTwoStepSMS instance
   */
	}, {
		key: 'sms',
		value: function sms() {
			return new _meTwoStepSms2['default'](this.wpcom);
		}
	}]);

	return MeTwoStep;
})();

module.exports = MeTwoStep;