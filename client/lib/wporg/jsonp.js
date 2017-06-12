/**
 * Simple jsonp module that works with the slightly unconventional api.wordpress.org api. Highly inspired by http://github.com/webmodules/jsonp
 */

/**
 * External dependencies
 */
var debug = require( 'debug' )( 'jsonp' ),
	qs = require( 'qs' );

/**
 * Module exports.
 */
module.exports = jsonp;

/**
 * Callback index.
 */
var count = 0;

/**
 * Noop function. Does nothing.
 */
function noop() { }

/**
 * JSONP handler
 *
 * @param {String} url
 * @param {Object} query params
 * @param {Function} optional callback
 */
function jsonp( url, query, fn ) {
	var prefix = '__jp',
		timeout = 60000,
		enc = encodeURIComponent,
		target = document.getElementsByTagName( 'script' )[ 0 ] || document.head,
		script,
		timer,
		id;

	// generate a unique id for this request
	id = prefix + ( count++ );

	if ( timeout ) {
		timer = setTimeout( function() {
			cleanup();
			if ( fn ) {
				fn( new Error( 'Timeout' ) );
			}
		}, timeout );
	}

	function cleanup() {
		if ( script.parentNode ) {
			script.parentNode.removeChild( script );
		}

		window[ id ] = noop;
		if ( timer ) {
			clearTimeout( timer );
		}
	}

	function cancel() {
		if ( window[ id ] ) {
			cleanup();
		}
	}

	window[ id ] = function( data ) {
		debug( 'jsonp got', data );
		cleanup();
		if ( fn ) {
			fn( null, data );
		}
	};

	// add qs component
	url += '=' + enc( id ) + '?' + qs.stringify( query );

	debug( 'jsonp req "%s"', url );

	// create script
	script = document.createElement( 'script' );
	script.src = url;
	target.parentNode.insertBefore( script, target );

	return cancel;
}
