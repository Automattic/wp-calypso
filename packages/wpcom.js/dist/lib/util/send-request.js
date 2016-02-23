var _Promise = require('babel-runtime/core-js/promise')['default'];

/**
 * Module dependencies
 */
var qs = require('qs');
var debug = require('debug')('wpcom:send-request');
var debug_res = require('debug')('wpcom:send-request:res');

/**
 * Request to WordPress REST API
 *
 * @param {String|Object} params - params object
 * @param {Object} [query] - query object parameter
 * @param {Object} [body] - body object parameter
 * @param {Function} fn - callback function
 * @return {Function} request handler
 */
module.exports = function (params, query, body, fn) {
	var _this = this;

	// `params` can be just the path ( String )
	params = 'string' === typeof params ? { path: params } : params;

	debug('sendRequest(%o )', params.path);

	// set `method` request param
	params.method = (params.method || 'get').toUpperCase();

	// `query` is optional
	if ('function' === typeof query) {
		fn = query;
		query = {};
	}

	// `body` is optional
	if ('function' === typeof body) {
		fn = body;
		body = null;
	}

	// query could be `null`
	query = query || {};

	// Handle special query parameters
	// - `apiVersion`
	if (query.apiVersion) {
		params.apiVersion = query.apiVersion;
		debug('apiVersion: %o', params.apiVersion);
		delete query.apiVersion;
	} else {
		params.apiVersion = this.apiVersion;
	}

	// - `apiNamespace`
	if (query.apiNamespace) {
		params.apiNamespace = query.apiNamespace;
		debug('apiNamespace: %o', params.apiNamespace);
		delete query.apiNamespace;
	}

	// - `proxyOrigin`
	if (query.proxyOrigin) {
		params.proxyOrigin = query.proxyOrigin;
		debug('proxyOrigin: %o', params.proxyOrigin);
		delete query.proxyOrigin;
	}

	// Stringify query object before to send
	query = qs.stringify(query, { arrayFormat: 'brackets' });

	// pass `query` and/or `body` to request params
	params.query = query;

	if (body) {
		params.body = body;
	}
	debug('params: %o', params);

	// if callback is provided, behave traditionally
	if ('function' === typeof fn) {
		// request method
		return this.request(params, function (err, res) {
			debug_res(res);
			fn(err, res);
		});
	}

	// but if not, return a Promise
	return new _Promise(function (resolve, reject) {
		_this.request(params, function (err, res) {
			debug_res(res);
			err ? reject(err) : resolve(res);
		});
	});
};