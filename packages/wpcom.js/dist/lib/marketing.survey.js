var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _defineProperty = require('babel-runtime/helpers/define-property')['default'];

var _Object$assign2 = require('babel-runtime/core-js/object/assign')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
/**
 * Module vars
 */
var root = '/marketing/survey';

var MarketingSurvey = (function () {
	/**
  * `MarketingSurvey` constructor.
  *
  * @param {String} id - survey identification
  * @param {String} [siteId] - site identification
  * @param {WPCOM} wpcom - wpcom instance
  * @return {Undefined} undefined
  */

	function MarketingSurvey(id, siteId, wpcom) {
		_classCallCheck(this, MarketingSurvey);

		if (!id) {
			throw new TypeError('`id` survey is not correctly defined');
		}

		if (!(this instanceof MarketingSurvey)) {
			return new MarketingSurvey(id, siteId, wpcom);
		}

		if (typeof siteId === 'object') {
			this.wpcom = siteId;
		} else {
			this._siteId = siteId;
			this.wpcom = wpcom;
		}

		this._id = id;
		this._responses = {};
	}

	_createClass(MarketingSurvey, [{
		key: 'setSiteId',
		value: function setSiteId(siteId) {
			this._siteId = siteId;
			return this;
		}
	}, {
		key: 'addResponse',
		value: function addResponse(key, value) {
			this._responses = _Object$assign2({}, this._responses, _defineProperty({}, key, value));
			return this;
		}
	}, {
		key: 'addResponses',
		value: function addResponses(responses) {
			this._responses = _Object$assign2({}, this._responses, responses);
			return this;
		}

		/**
   * Submit a marketing survey.
   *
   * @param {Object} [query] - query object parameter
   * @param {Object} [body] - body object parameter
   * @param {Function} [fn] - callback function
   * @return {Promise} Promise
   */
	}, {
		key: 'submit',
		value: function submit(query, body, fn) {
			if (query === undefined) query = {};
			if (body === undefined) body = {};

			body.survey_id = this._id;
			body.site_id = body.site_id || this._siteId;
			body.survey_responses = body.survey_responses || this._responses;
			return this.wpcom.req.post('' + root, query, body, fn);
		}
	}]);

	return MarketingSurvey;
})();

exports['default'] = MarketingSurvey;
module.exports = exports['default'];