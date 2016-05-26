var _Promise = require('babel-runtime/core-js/promise')['default'];

/**
 * Module dependencies.
 */
var requestHandler = require('wpcom-xhr-request');

/**
 * Local module dependencies.
 */
var Batch = require('./lib/batch');
var Domain = require('./lib/domain');
var Domains = require('./lib/domains');
var Marketing = require('./lib/marketing');
var Me = require('./lib/me');
var Pinghub = require('./lib/util/pinghub');
var Plans = require('./lib/plans');
var Req = require('./lib/util/request');
var Site = require('./lib/site');
var Users = require('./lib/users');

var sendRequest = require('./lib/util/send-request');
var debug = require('debug')('wpcom');

/**
 * Local module constants
 */
var DEFAULT_ASYNC_TIMEOUT = 30000;

/**
 * XMLHttpRequest (and CORS) API access method.
 *
 * API authentication is done via an (optional) access `token`,
 * which needs to be retrieved via OAuth.
 *
 * Request Handler is optional and XHR is defined as default.
 *
 * @param {String} [token] - OAuth API access token
 * @param {Function} [reqHandler] - function Request Handler
 * @return {WPCOM} wpcom instance
 */
function WPCOM(token, reqHandler) {
	if (!(this instanceof WPCOM)) {
		return new WPCOM(token, reqHandler);
	}

	// `token` is optional
	if ('function' === typeof token) {
		reqHandler = token;
		token = null;
	}

	if (token) {
		debug('Token defined: %s…', token.substring(0, 6));
		this.token = token;
	}

	// Set default request handler
	if (!reqHandler) {
		debug('No request handler. Adding default XHR request handler');

		this.request = function (params, fn) {
			params = params || {};

			// token is optional
			if (token) {
				params.authToken = token;
			}

			return requestHandler(params, fn);
		};
	} else {
		this.request = reqHandler;
	}

	// Add Req instance
	this.req = new Req(this);

	// Add Pinghub instance
	this.pinghub = new Pinghub(this);

	// Default api version;
	this.apiVersion = '1.1';
}

/**
 * Return `Marketing` object instance
 *
 * @return {Marketing} Marketing instance
 */
WPCOM.prototype.marketing = function () {
	return new Marketing(this);
};

/**
 * Return `Me` object instance
 *
 * @return {Me} Me instance
 */
WPCOM.prototype.me = function () {
	return new Me(this);
};

/**
 * Return `Domains` object instance
 *
 * @return {Domains} Domains instance
 */
WPCOM.prototype.domains = function () {
	return new Domains(this);
};

/**
 * Return `Domain` object instance
 *
 * @param {String} domainId - domain identifier
 * @return {Domain} Domain instance
 */
WPCOM.prototype.domain = function (domainId) {
	return new Domain(domainId, this);
};

/**
 * Return `Site` object instance
 *
 * @param {String} id - site identifier
 * @return {Site} Site instance
 */
WPCOM.prototype.site = function (id) {
	return new Site(id, this);
};

/**
 * Return `Users` object instance
 *
 * @return {Users} Users instance
 */
WPCOM.prototype.users = function () {
	return new Users(this);
};

/**
 * Return `Plans` object instance
 *
 * @return {Plans} Plans instance
 */
WPCOM.prototype.plans = function () {
	return new Plans(this);
};

/**
* Return `Batch` object instance
*
* @return {Batch} Batch instance
*/
WPCOM.prototype.batch = function () {
	return new Batch(this);
};

/**
 * List Freshly Pressed Posts
 *
 * @param {Object} [query] - query object
 * @param {Function} fn - callback function
 * @return {Function} request handler
 */
WPCOM.prototype.freshlyPressed = function (query, fn) {
	return this.req.get('/freshly-pressed', query, fn);
};

/**
 * Expose send-request
 * @TODO: use `this.req` instead of this method
 */

WPCOM.prototype.sendRequest = function (params, query, body, fn) {
	var msg = 'WARN! Don use `sendRequest() anymore. Use `this.req` method.';

	if (console && console.warn) {
		console.warn(msg);
	} else {
		console.log(msg);
	}

	return sendRequest.call(this, params, query, body, fn);
};

if (!_Promise.prototype.timeout) {
	/**
 * Returns a new promise with a deadline
 *
 * After the timeout interval, the promise will
 * reject. If the actual promise settles before
 * the deadline, the timer is cancelled.
 *
 * @param {number} delay how many ms to wait
 * @return {Promise} promise
 */
	_Promise.prototype.timeout = function () {
		var _this = this;

		var delay = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_ASYNC_TIMEOUT : arguments[0];

		var cancelTimeout = undefined,
		    timer = undefined,
		    timeout = undefined;

		timeout = new _Promise(function (resolve, reject) {
			timer = setTimeout(function () {
				reject(new Error('Action timed out while waiting for response.'));
			}, delay);
		});

		cancelTimeout = function () {
			clearTimeout(timer);
			return _this;
		};

		return _Promise.race([this.then(cancelTimeout)['catch'](cancelTimeout), timeout]);
	};
}

/**
 * Expose `WPCOM` module
 */
module.exports = WPCOM;
