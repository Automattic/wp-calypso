var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
/**
 * Local module dependencies.
 */

var _marketingSurvey = require('./marketing.survey');

var _marketingSurvey2 = _interopRequireDefault(_marketingSurvey);

var Marketing = (function () {
	/**
  * `Marketing` constructor.
  *
  * @param {WPCOM} wpcom - wpcom instance
  * @return {Undefined} undefined
  */

	function Marketing(wpcom) {
		_classCallCheck(this, Marketing);

		if (!(this instanceof Marketing)) {
			return new Marketing(wpcom);
		}
		this.wpcom = wpcom;
	}

	/**
  * Return `MarketingSurvey` object instance
  *
  * @param {String} id - survey idetification
  * @param {String} [siteId] - site identification
  * @return {MarketingSurvey} MarketingSurvey instance
  */

	_createClass(Marketing, [{
		key: 'survey',
		value: function survey(id, siteId) {
			return new _marketingSurvey2['default'](id, siteId, this.wpcom);
		}
	}]);

	return Marketing;
})();

exports['default'] = Marketing;
module.exports = exports['default'];