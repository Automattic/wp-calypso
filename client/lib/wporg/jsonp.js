/**
 * Simple jsonp module that works with the slightly unconventional api.wordpress.org api. Highly inspired by http:
 *
 */

/**
 * External dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'jsonp' );
import { stringify } from 'qs';

/**
 * Module exports.
 */
export default jsonp;

/**
 * Callback index.
 */
let count = 0;

/**
 * Noop function. Does nothing.
 */
function noop() {}

/**
 * JSONP handler
 *
 * @param {string} url
 * @param {object} query params
 * @param {Function} optional callback
 */
function jsonp( url, query, fn ) {
	let prefix = '__jp',
		timeout = 60000,
		enc = encodeURIComponent,
		target = document.getElementsByTagName( 'script' )[ 0 ] || document.head,
		script,
		timer,
		id;

	// generate a unique id for this request
	id = prefix + count++;

	if ( timeout ) {
		timer = setTimeout( function () {
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

	window[ id ] = function ( data ) {
		debug( 'jsonp got', data );
		cleanup();
		if ( fn ) {
			fn( null, data );
		}
	};

	// add qs component
	url += '=' + enc( id ) + '?' + stringify( query );

	debug( 'jsonp req "%s"', url );

	// create script
	script = document.createElement( 'script' );
	script.src = url;
	target.parentNode.insertBefore( script, target );

	return cancel;
}
