

/**
 * Module dependencies.
 */

var request_handler = require('wpcom-xhr-request');

/**
 * Local module dependencies.
 */

var Me = require('./lib/me');
var Site = require('./lib/site');
var Users = require('./lib/users');
var Batch = require('./lib/batch');
var Req = require('./lib/util/request');
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

      return request_handler(params, fn);
    };
  } else {
    this.request = reqHandler;
  }

  // Add Req instance
  this.req = new Req(this);

  // Default api version;
  this.apiVersion = '1.1';
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

  return sendRequest.call(this, params, query, body, fn)
};

/**
 * Wraps a library callback into a Promise
 *
 * Remember to bind the method to its parent
 * context - extracting it out otherwise removes it.
 *
 * E.g.
 * wpcom.Promise( comment.del.bind( comment ) );
 *
 * The promise rejects if the normal error return from
 * an API call is not empty. It resolves otherwise.
 *
 * @param {function} callback wpcom.js method to call
 * @param params variable list of parameters to send to callback
 * @returns {Promise}
 */
WPCOM.prototype.Promise = ( callback, ...params ) => {
  return new Promise( ( resolve, reject ) => {
    // The functions here take a variable number of arguments,
    // so pass in as many as we can but keep the callback last.
    callback.apply( callback, [...params, ( error, data ) => {
      error ? reject( error ) : resolve( data );
    } ] );
  } );
};

if ( ! Promise.prototype.timeout ) {
	/**
     * Returns a new promise with a deadline
     *
     * After the timeout interval, the promise will
     * reject. If the actual promise settles before
     * the deadline, the timer is cancelled.
     *
     * @param {number} delay how many ms to wait
     * @returns {Promise}
     */
  Promise.prototype.timeout = function( delay = DEFAULT_ASYNC_TIMEOUT ) {
    let cancelTimeout, timer, timeout;

    timeout = new Promise( ( resolve, reject ) => {
      timer = setTimeout( () => {
        reject( new Error( 'Action timed out while waiting for response.' ) );
      }, delay );
    } );

    cancelTimeout = () => {
      clearTimeout( timer );
      return this;
    };

    return Promise.race( [ this.then( cancelTimeout ).catch( cancelTimeout ), timeout ] );
  };
}

/**
 * Expose `WPCOM` module
 */

module.exports = WPCOM;
