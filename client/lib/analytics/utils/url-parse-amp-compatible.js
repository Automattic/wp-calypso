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

	return window.atob( str.replace( /[-_.]/g, ( ch ) => decodeMap[ ch ] ) );
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
		.filter( ( val ) => val.length )
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
 * Returns a URL instance with the original data plus the data extracted from `tk_amp`. Null if not a valid absolute URL.
 * URL parameters explicitly present in the URL take precedence over the ones extracted from `tk_amp`.
 * This function is used to support AMP-compatible tracking.
 *
 * @param {string} url URL to be parsed like `document.location.href`.
 * @returns {object} A URL instance with the original data plus the data extracted from `tk_amp`. Null if not a valid absolute URL.
 */
export default function urlParseAmpCompatible( url ) {
	try {
		const parsedUrl = new URL( url );

		debug( 'urlParseAmpCompatible: original query:', parsedUrl.search );

		if ( parsedUrl.searchParams.has( 'tk_amp' ) ) {
			const tk_amp = parseAmpEncodedParams( parsedUrl.searchParams.tk_amp );
			debug( 'urlParseAmpCompatible: tk_amp:', tk_amp );
			for ( const key of Object.keys( tk_amp ) ) {
				if ( ! parsedUrl.searchParams.has( key ) ) {
					parsedUrl.searchParams.set( key, tk_amp[ key ] );
				}
			}
		}

		debug( 'urlParseAmpCompatible: merged query:', parsedUrl.search );

		return parsedUrl;
	} catch {
		return null;
	}
}
