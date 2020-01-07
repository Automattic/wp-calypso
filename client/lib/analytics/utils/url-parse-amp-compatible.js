/**
 * External dependencies
 */
import { assign } from 'lodash';
import { parse as parseUrl } from 'url';

/**
 * Internal dependencies
 */
import debug from './debug';

/**
 * Decodes a url-safe base64 encoded string.
 *
 * @param {string} str The url-safe base64 encoded string
 * @returns {string} The decoded string
 */
function urlSafeBase64DecodeString( str ) {
	const decodeMap = {
		'-': '+',
		_: '/',
		'.': '=',
	};

	return atob( str.replace( /[-_.]/g, ch => decodeMap[ ch ] ) );
}

/**
 * Decodes a URL param encoded by AMP's linker.js
 * See also https://github.com/ampproject/amphtml/blob/master/extensions/amp-analytics/linker-id-receiving.md
 *
 * @param {string} value Value to be decoded
 * @returns {null|object} null or and object containing key/value pairs
 */
function parseAmpEncodedParams( value ) {
	value = value
		.split( '*' )
		.filter( val => val.length )
		.slice( 2 );
	// return null if empty or we have an odd number of elements
	if ( 0 === value.length || 0 !== value.length % 2 ) {
		return null;
	}
	const keyValMap = {};
	for ( let i = 0; i < value.length; i += 2 ) {
		keyValMap[ value[ i ] ] = urlSafeBase64DecodeString( value[ i + 1 ] );
	}

	return keyValMap;
}

/**
 * Returns an object equivalent to what url.parse( url, true ) would return plus the data extracted from `tk_amp`.
 * URL parameters explicitly present in the URL take precedence over the ones extracted from `tk_amp`.
 * This function is used to support AMP-compatible tracking.
 *
 * @param {string} url URL to be parsed like `document.location.href`.
 * @returns {object} An object equivalent to what url.parse( url, true ) would return plus the data extracted from in `tk_amp`
 */
export default function urlParseAmpCompatible( url ) {
	const parsedUrl = parseUrl( url, true );
	const query = parsedUrl.query;

	debug( 'urlParseAmpCompatible: original query:', query );

	if ( 'tk_amp' in query ) {
		const tk_amp = parseAmpEncodedParams( query.tk_amp );
		debug( 'urlParseAmpCompatible: tk_amp:', tk_amp );
		parsedUrl.query = assign( {}, tk_amp, query );
	}

	debug( 'urlParseAmpCompatible: merged query:', parsedUrl.query );

	return parsedUrl;
}
