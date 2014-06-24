
/**
 * Module dependencies.
 */

var uid = require('uid');
var event = require('component-event');
var Promise = require('promise');
var debug = require('debug')('wpcom-proxy-request');

/**
 * Export `request` function.
 */

module.exports = Promise.nodeify(request);

/**
 * WordPress.com REST API base endpoint.
 */

var proxyOrigin = 'https://public-api.wordpress.com';

/**
 * "Origin" of the current HTML page.
 */

var origin = window.location.protocol + '//' + window.location.hostname;
debug('using "origin": %o', origin);

/**
 * Reference to the <iframe> DOM element.
 * Gets set in the install() function.
 */

var iframe;

/**
 * Set to `true` upon the iframe's "load" event.
 */

var loaded = false;

/**
 * Array of buffered API requests. Added to when API requests are done before the
 * proxy <iframe> is "loaded", and fulfilled once the "load" DOM event on the
 * iframe occurs.
 */

var buffered;

/**
 * Firefox apparently doesn't like sending `File` instances cross-domain.
 * It results in a "DataCloneError: The object could not be cloned." error.
 * Apparently this is for "security purposes" but it's actually silly if that's
 * the argument because we can just read the File manually into an ArrayBuffer
 * and we can work around this "security restriction".
 *
 * See: https://bugzilla.mozilla.org/show_bug.cgi?id=722126#c8
 */

var hasFileSerializationBug = false;

/**
 * In-flight API request Promise instances.
 */

var requests = {};

/**
 * Performs a "proxied REST API request". This happens by calling
 * `iframe.postMessage()` on the proxy iframe instance, which from there
 * takes care of WordPress.com user authentication (via the currently
 * logged user's cookies).
 *
 * @param {Object|String} params
 * @api public
 */

function request (params) {
  debug('request()', params);

  if ('string' == typeof params) {
    params = { path: params };
  }

  // inject the <iframe> upon the first proxied API request
  if (!iframe) install();

  // generate a uid for this API request
  var id = uid();
  params.callback = id;
  params.supports_args = true; // supports receiving variable amount of arguments

  // force uppercase "method" since that's what the <iframe> is expecting
  params.method = String(params.method || 'GET').toUpperCase();

  debug('params object: %o', params);

  var req = new Promise(function (resolve, reject) {
    if (loaded) {
      submitRequest(params, resolve, reject);
    } else {
      debug('buffering API request since proxying <iframe> is not yet loaded');
      buffered.push([ params, resolve, reject ]);
    }
  });

  // store the `params` object so that "onmessage" can access it again
  requests[id] = params;

  return req;
}

/**
 * Calls the postMessage() function on the <iframe>, and afterwards add the
 * `resolve` and `reject` functions to the "params" object (after it's been
 * serialized into the iframe context).
 *
 * @param {Object} params
 * @param {Function} resolve
 * @param {Function} reject
 * @api private
 */

function submitRequest (params, resolve, reject) {
  debug('sending API request to proxy <iframe> %o', params);

  if (hasFileSerializationBug && hasFile(params)) {
    postAsArrayBuffer(params, resolve, reject);
  } else {
    try {
      iframe.contentWindow.postMessage(params, proxyOrigin);

      // needs to be added after the `.postMessage()` call otherwise
      // a DOM error is thrown
      params.resolve = resolve;
      params.reject = reject;
    } catch (e) {
      // were we trying to serialize a `File`?
      if (hasFile(params)) {
        // cache this check for the next API request
        hasFileSerializationBug = true;
        debug('this browser has the File serialization bug');
        postAsArrayBuffer(params, resolve, reject);
      } else {
        // not interested, rethrow
        throw e;
      }
    }
  }
}

/**
 * Returns `true` if there's a `File` instance in the `params`, or `false`
 * otherwise.
 *
 * @param {Object} params
 * @return {Boolean}
 * @private
 */

function hasFile (params) {
  var formData = params.formData;
  if (formData && formData.length > 0) {
    for (var i = 0; i < formData.length; i++) {
      if (isFile(formData[i][1])) return true;
    }
  }
  return false;
}

/**
 * Returns `true` if `v` is a DOM File instance, `false` otherwise.
 *
 * @param {Mixed} v
 * @return {Boolean}
 * @private
 */

function isFile (v) {
  return v && Object.prototype.toString.call(v) === '[object File]';
}

/**
 * Turns all `File` instances into `ArrayBuffer` objects in order to serialize
 * the data over the iframe `postMessage()` call.
 *
 * @param {Object} params
 * @param {Function} resolve
 * @param {Function} reject
 * @private
 */

function postAsArrayBuffer (params, resolve, reject) {
  debug('converting File instances to ArrayBuffer before invoking postMessage()');
  // TODO: iterate over all the params and convert all File instances
  var reader = new FileReader();
  var file = params.formData[0][1];
  reader.onload = function (e) {
    var arrayBuffer = e.target.result;
    debug('finished reading %o (%o bytes)', file.name, arrayBuffer.byteLength);

    params.formData[0][1] = {
      fileContents: arrayBuffer,
      fileName: file.name,
      mimeType: file.type
    };

    iframe.contentWindow.postMessage(params, proxyOrigin);

    // needs to be added after the `.postMessage()` call otherwise
    // a DOM error is thrown
    params.resolve = resolve;
    params.reject = reject;
  };
  reader.readAsArrayBuffer(file);
}

/**
 * Injects the proxy <iframe> instance in the <body> of the current
 * HTML page.
 *
 * @api private
 */

function install () {
  debug('install()');
  if (iframe) uninstall();

  buffered = [];

  // listen to messages sent to `window`
  event.bind(window, 'message', onmessage);

  // create the <iframe>
  iframe = document.createElement('iframe');

  // set `loaded` to true once the "load" event happens
  event.bind(iframe, 'load', onload);

  // set `src` and hide the iframe
  iframe.src = proxyOrigin + '/wp-admin/rest-proxy/#' + origin;
  iframe.style.display = 'none';

  // inject the <iframe> into the <body>
  document.body.appendChild(iframe);
}

/**
 * The proxy <iframe> instance's "load" event callback function.
 *
 * @param {Event} e
 * @api private
 */

function onload (e) {
  debug('proxy <iframe> "load" event');
  loaded = true;

  // flush any buffered API calls
  for (var i = 0; i < buffered.length; i++) {
    submitRequest.apply(null, buffered[i]);
  }
  buffered = null;
}

/**
 * The main `window` object's "message" event callback function.
 *
 * @param {Event} e
 * @api private
 */

function onmessage (e) {
  debug('onmessage');

  // safeguard...
  if (e.origin !== proxyOrigin) {
    debug('ignoring message... %o !== %o', e.origin, proxyOrigin);
    return;
  }

  var data = e.data;
  if (!data || !data.length) {
    debug('`e.data` doesn\'t appear to be an Array, bailing...');
    return;
  }

  var id = data[data.length - 1];
  var params = requests[id];
  delete requests[id];

  var body = data[0];
  var statusCode = data[1];
  var headers = data[2];

  if (!params.metaAPI) {
    debug('got %o status code for URL: %o', statusCode, params.path);
  }

  if (body && headers) {
    body._headers = headers;
  }

  if (null == statusCode || 2 === Math.floor(statusCode / 100)) {
    // 2xx status code, success
    params.resolve(body);
  } else {
    // any other status code is a failure
    var err = new Error();
    err.statusCode = statusCode;
    for (var i in body) err[i] = body[i];
    if (body.error) err.name = toTitle(body.error) + 'Error';

    params.reject(err);
  }
}

function toTitle (str) {
  if (!str || 'string' !== typeof str) return '';
  return str.replace(/((^|_)[a-z])/g, function ($1) {
    return $1.toUpperCase().replace('_', '');
  });
}
