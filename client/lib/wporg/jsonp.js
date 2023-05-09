/**
 * Simple jsonp module that works with the slightly unconventional api.wordpress.org api. Highly inspired by http:
 *
 */

import debugFactory from 'debug';
import { stringify } from 'qs';

const debug = debugFactory( 'jsonp' );

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
 * @param {Object} query params
 * @param {Function} fn optional callback
 */
function jsonp( url, query, fn ) {
	const prefix = '__jp';
	const timeout = 60000;
	const enc = encodeURIComponent;
	const target = document.getElementsByTagName( 'script' )[ 0 ] || document.head;
	let timer;

	// generate a unique id for this request
	const id = prefix + count++;

	if ( timeout ) {
		timer = setTimeout( function () {
			cleanup();
			if ( fn ) {
				fn( new Error( 'Timeout' ) );
			}
		}, timeout );
	}

	// create script
	const script = document.createElement( 'script' );

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
	script.src = url;

	// add the script
	target.parentNode.insertBefore( script, target );

	return cancel;
}
