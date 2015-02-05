
/**
 * Module dependencies.
 */

var request = require('wpcom-xhr-request');

/**
 * Local module dependencies.
 */

var Me = require('./lib/me');
var Site = require('./lib/site');
var Users = require('./lib/users');
var Batch = require('./lib/batch');
var debug = require('debug')('wpcom');

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
 * @public
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

      return request(params, fn);
    };
  } else {
    this.request = reqHandler;
  }
}

/**
 * Get `Me` object instance
 *
 * @api public
 */

WPCOM.prototype.me = function () {
  return new Me(this);
};

/**
 * Get `Site` object instance
 *
 * @param {String} id
 * @api public
 */

WPCOM.prototype.site = function (id) {
  return new Site(id, this);
};

/**
 * Get `Users` object instance
 *
 * @api public
 */

WPCOM.prototype.users = function () {
  return new Users(this);
};


WPCOM.prototype.batch = function () {
  return new Batch(this);
};

/**
 * List Freshly Pressed Posts
 *
 * @param {Object} [query]
 * @param {Function} fn callback function
 * @api public
 */

WPCOM.prototype.freshlyPressed = function (query, fn) {
  return this.sendRequest('/freshly-pressed', query, null, fn);
};

/**
 * Request to WordPress REST API
 *
 * @param {String|Object} params
 * @param {Object} [query]
 * @param {Object} [body]
 * @param {Function} fn
 * @api private
 */

WPCOM.prototype.sendRequest = function (params, query, body, fn) {
  // `params` can be just the path (String)
  if ('string' === typeof params) {
    params = { path: params };
  }

  debug('sendRequest(%o)', params.path);

  // set `method` request param
  params.method = (params.method || 'get').toUpperCase();

  // `query` is optional
  if ('function' === typeof query) {
    fn = query;
    query = null;
  }

  // `body` is optional
  if ('function' === typeof body) {
    fn = body;
    body = null;
  }

  // pass `query` and/or `body` to request params
  if (query) {
    params.query = query;

    // Handle special query parameters
    // - `apiVersion`
    if (query.apiVersion) {
      params.apiVersion = query.apiVersion;
      delete query.apiVersion;
    }
  }

  if (body) {
    params.body = body;
  }

  // callback `fn` function is optional
  if (!fn) {
    fn = function (err) { if (err) { throw err; } };
  }

  // request method
  return this.request(params, fn);
};

/**
 * Expose `WPCOM` module
 */

module.exports = WPCOM;