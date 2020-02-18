/**
 * Module dependencies.
 */
import uid from 'uid';
import WPError from 'wp-error';
import event from 'component-event';
import ProgressEvent from 'progress-event';
import debugFactory from 'debug';

/**
 * debug instance
 */
const debug = debugFactory( 'wpcom-proxy-request' );

/**
 * WordPress.com REST API base endpoint.
 */
const proxyOrigin = 'https://public-api.wordpress.com';

/**
 * "Origin" of the current HTML page.
 */
const origin = window.location.protocol + '//' + window.location.host;

/**
 * Detecting support for the structured clone algorithm. IE8 and 9, and Firefox
 * 6.0 and below only support strings as postMessage's message. This browsers
 * will try to use the toString method.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
 * https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm
 * https://github.com/Modernizr/Modernizr/issues/388#issuecomment-31127462
 */
const postStrings = ( () => {
	let r = false;
	try {
		window.postMessage(
			{
				toString: function() {
					r = true;
				},
			},
			'*'
		);
	} catch ( e ) {
		/* empty */
	}
	return r;
} )();

/**
 * Test if the browser supports constructing a new `File` object. Not present on Edge and IE.
 */
const supportsFileConstructor = ( () => {
	try {
		// eslint-disable-next-line no-new
		new File( [ 'a' ], 'test.jpg', { type: 'image/jpeg' } );
		return true;
	} catch ( e ) {
		return false;
	}
} )();

/**
 * Reference to the <iframe> DOM element.
 * Gets set in the install() function.
 */
let iframe = null;

/**
 * Set to `true` upon the iframe's "load" event.
 */
let loaded = false;

/**
 * Array of buffered API requests. Added to when API requests are done before the
 * proxy <iframe> is "loaded", and fulfilled once the "load" DOM event on the
 * iframe occurs.
 */
let buffered;

/**
 * In-flight API request XMLHttpRequest dummy "proxy" instances.
 */
const requests = {};

/**
 * Are HTML5 XMLHttpRequest2 "progress" events supported?
 * See: http://goo.gl/xxYf6D
 */
const supportsProgress = !! window.ProgressEvent && !! window.FormData;

debug( 'using "origin": %o', origin );

/**
 * Performs a "proxied REST API request". This happens by calling
 * `iframe.postMessage()` on the proxy iframe instance, which from there
 * takes care of WordPress.com user authentication (via the currently
 * logged-in user's cookies).
 *
 * @param {Object} originalParams - request parameters
 * @param {Function} [fn] - callback response
 * @return {XMLHttpRequest} XMLHttpRequest instance
 * @api public
 */
const request = ( originalParams, fn ) => {
	let params = Object.assign( {}, originalParams );

	debug( 'request(%o)', params );

	// inject the <iframe> upon the first proxied API request
	if ( ! iframe ) {
		install();
	}

	// generate a uid for this API request
	const id = uid();
	params.callback = id;
	params.supports_args = true; // supports receiving variable amount of arguments
	params.supports_error_obj = true; // better Error object info
	params.supports_progress = supportsProgress; // supports receiving XHR "progress" events

	// force uppercase "method" since that's what the <iframe> is expecting
	params.method = String( params.method || 'GET' ).toUpperCase();

	debug( 'params object: %o', params );

	const xhr = new XMLHttpRequest();
	xhr.params = params;

	// store the `XMLHttpRequest` instance so that "onmessage" can access it again
	requests[ id ] = xhr;

	if ( 'function' === typeof fn ) {
		// a callback function was provided
		let called = false;
		function xhrOnLoad( e ) {
			if ( called ) {
				return;
			}

			called = true;
			const body = e.response || xhr.response;
			debug( 'body: ', body );
			debug( 'headers: ', e.headers );
			fn( null, body, e.headers );
		}
		function xhrOnError( e ) {
			if ( called ) {
				return;
			}

			called = true;
			const error = e.error || e.err || e;
			debug( 'error: ', error );
			debug( 'headers: ', e.headers );
			fn( error, null, e.headers );
		}

		event.bind( xhr, 'load', xhrOnLoad );
		event.bind( xhr, 'abort', xhrOnError );
		event.bind( xhr, 'error', xhrOnError );
	}

	if ( loaded ) {
		submitRequest( params );
	} else {
		debug( 'buffering API request since proxying <iframe> is not yet loaded' );
		buffered.push( params );
	}

	return xhr;
};

/**
 * Calls the `postMessage()` function on the <iframe>.
 *
 * @param {Object} params
 * @api private
 */

function submitRequest( params ) {
	debug( 'sending API request to proxy <iframe> %o', params );

	// `formData` needs to be patched if it contains `File` objects to work around
	// a Chrome bug. See `patchFileObjects` description for more details.
	if ( params.formData ) {
		patchFileObjects( params.formData );
	}

	iframe.contentWindow.postMessage( postStrings ? JSON.stringify( params ) : params, proxyOrigin );
}

/**
 * Returns `true` if `v` is a DOM File instance, `false` otherwise.
 *
 * @param {Mixed} v - instance to analyze
 * @return {Boolean} `true` if `v` is a DOM File instance
 * @private
 */
function isFile( v ) {
	return v && Object.prototype.toString.call( v ) === '[object File]';
}

/*
 * Find a `File` object in a form data value. It can be either the value itself, or
 * in a `fileContents` property of the value.
 */
function getFileValue( v ) {
	if ( isFile( v ) ) {
		return v;
	}

	if ( typeof v === 'object' && isFile( v.fileContents ) ) {
		return v.fileContents;
	}

	return null;
}

/**
 * Finds all `File` instances in `formData` and creates a new `File` instance whose storage is
 * forced to be a `Blob` instead of being backed by a file on disk. That works around a bug in
 * Chrome where `File` instances with `has_backing_file` flag cannot be sent over a process
 * boundary when site isolation is on.
 *
 * @see https://bugs.chromium.org/p/chromium/issues/detail?id=866805
 * @see https://bugs.chromium.org/p/chromium/issues/detail?id=631877
 *
 * @param {Array} formData Form data to patch
 */
function patchFileObjects( formData ) {
	// There are several landmines to avoid when making file uploads work on all browsers:
	// - the `new File()` constructor trick breaks file uploads on Safari 10 in a way that's
	//   impossible to detect: it will send empty files in the multipart/form-data body.
	//   Therefore we need to detect Chrome.
	// - IE11 and Edge don't support the `new File()` constructor at all. It will throw exception,
	//   so it's detectable by the `supportsFileConstructor` code.
	// - `window.chrome` exists also on Edge (!), `window.chrome.webstore` is only in Chrome and
	//   not in other Chromium based browsers (which have the site isolation bug, too).
	if ( ! window.chrome || ! supportsFileConstructor ) {
		return;
	}

	for ( let i = 0; i < formData.length; i++ ) {
		const val = getFileValue( formData[ i ][ 1 ] );
		if ( val ) {
			formData[ i ][ 1 ] = new File( [ val ], val.name, { type: val.type } );
		}
	}
}

/**
 * Injects the proxy <iframe> instance in the <body> of the current
 * HTML page.
 *
 * @api private
 */

function install() {
	debug( 'install()' );
	if ( iframe ) {
		uninstall();
	}

	buffered = [];

	// listen to messages sent to `window`
	event.bind( window, 'message', onmessage );

	// create the <iframe>
	iframe = document.createElement( 'iframe' );

	// set `src` and hide the iframe
	iframe.src = proxyOrigin + '/wp-admin/rest-proxy/?v=2.0#' + origin;
	iframe.style.display = 'none';

	// inject the <iframe> into the <body>
	document.body.appendChild( iframe );
}

/**
 * Reloads the proxy iframe.
 *
 * @api public
 */
const reloadProxy = () => {
	install();
};

/**
 * Removes the <iframe> proxy instance from the <body> of the page.
 *
 * @api private
 */
function uninstall() {
	debug( 'uninstall()' );
	event.unbind( window, 'message', onmessage );
	document.body.removeChild( iframe );
	loaded = false;
	iframe = null;
}

/**
 * The proxy <iframe> instance's "load" event callback function.
 *
 * @api private
 */

function onload() {
	debug( 'proxy <iframe> "load" event' );
	loaded = true;

	// flush any buffered API calls
	if ( buffered ) {
		for ( let i = 0; i < buffered.length; i++ ) {
			submitRequest( buffered[ i ] );
		}
		buffered = null;
	}
}

/**
 * The main `window` object's "message" event callback function.
 *
 * @param {Event} e
 * @api private
 */

function onmessage( e ) {
	debug( 'onmessage' );

	// safeguard...
	if ( e.origin !== proxyOrigin ) {
		debug( 'ignoring message... %o !== %o', e.origin, proxyOrigin );
		return;
	}

	let { data } = e;
	if ( ! data ) {
		return debug( 'no `data`, bailing' );
	}

	// Once the iframe is loaded, we can start using it.
	if ( data === 'ready' ) {
		onload();
		return;
	}

	if ( postStrings && 'string' === typeof data ) {
		data = JSON.parse( data );
	}

	// check if we're receiving a "progress" event
	if ( data.upload || data.download ) {
		return onprogress( data );
	}

	if ( ! data.length ) {
		return debug( "`e.data` doesn't appear to be an Array, bailing..." );
	}

	// first get the `xhr` instance that we're interested in
	const id = data[ data.length - 1 ];
	if ( ! ( id in requests ) ) {
		return debug( 'bailing, no matching request with callback: %o', id );
	}

	const xhr = requests[ id ];

	// Build `error` and `body` object from the `data` object
	const { params } = xhr;
	let body, statusCode, headers;

	// apiNamespace (WP-API)
	const { apiNamespace } = params;

	body = data[ 0 ];
	statusCode = data[ 1 ];
	headers = data[ 2 ];

	if ( statusCode === 207 ) {
		// 207 is a signal from rest-proxy. It means, "this isn't the final
		// response to the query." The proxy supports WebSocket connections
		// by invoking the original success callback for each message received.
	} else {
		// this is the final response to this query
		delete requests[ id ];
	}

	if ( ! params.metaAPI ) {
		debug( 'got %o status code for URL: %o', statusCode, params.path );
	} else {
		statusCode = body === 'metaAPIupdated' ? 200 : 500;
	}

	// add statusCode into headers object
	if ( typeof headers === 'object' ) {
		headers.status = statusCode;
	}

	if ( statusCode && 2 === Math.floor( statusCode / 100 ) ) {
		// 2xx status code, success
		resolve( xhr, body, headers );
	} else {
		// any other status code is a failure
		const wpe = WPError( params, statusCode, body );
		reject( xhr, wpe, headers );
	}
}

/**
 * Handles a "progress" event being proxied back from the iframe page.
 *
 * @param {Object} data
 * @private
 */

function onprogress( data ) {
	debug( 'got "progress" event: %o', data );
	const xhr = requests[ data.callbackId ];
	if ( xhr ) {
		const prog = new ProgressEvent( 'progress', data );
		const target = data.upload ? xhr.upload : xhr;
		target.dispatchEvent( prog );
	}
}

/**
 * Emits the "load" event on the `xhr`.
 *
 * @param {XMLHttpRequest} xhr
 * @param {Object} body
 * @private
 */

function resolve( xhr, body, headers ) {
	const e = new ProgressEvent( 'load' );
	e.data = e.body = e.response = body;
	e.headers = headers;
	xhr.dispatchEvent( e );
}

/**
 * Emits the "error" event on the `xhr`.
 *
 * @param {XMLHttpRequest} xhr
 * @param {Error} err
 * @private
 */

function reject( xhr, err, headers ) {
	const e = new ProgressEvent( 'error' );
	e.error = e.err = err;
	e.headers = headers;
	xhr.dispatchEvent( e );
}

/**
 * Export `request` function.
 */
export default request;
export { reloadProxy };
