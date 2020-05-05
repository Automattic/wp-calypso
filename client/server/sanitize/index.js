/**
 * Encode single characters with backslashes.
 *
 * @param {string} charStr single-character string.
 * @returns {string} backslash escaped character.
 * @copyright (c) 2013, GoInstant Inc., a salesforce.com company.
 * @license See CREDITS.md.
 * @see https://github.com/goinstant/secure-filters/blob/master/lib/secure-filters.js
 * @private
 */

function jsSlashEncoder( charStr ) {
	const code = charStr.charCodeAt( 0 ),
		hex = code.toString( 16 ).toUpperCase();

	if ( code < 0x80 ) {
		// ASCII
		if ( hex.length === 1 ) {
			return '\\x0' + hex;
		}

		return '\\x' + hex;
	}

	// Unicode
	switch ( hex.length ) {
		case 2:
			return '\\u00' + hex;
		case 3:
			return '\\u0' + hex;
		case 4:
			return '\\u' + hex;
		default:
			// charCodeAt() JS shouldn't return code > 0xFFFF, and only four hex
			// digits can be encoded via `\u`-encoding, so return REPLACEMENT
			// CHARACTER U+FFFD.
			return '\\uFFFD';
	}
}

/**
 * Create JSON serialized string suitable for inclusion in HTML
 *
 * @param {mixed} value The variable to be serialized
 * @returns {string} JSON serialized string
 **/
exports.jsonStringifyForHtml = function ( value ) {
	const jsonInHtmlBlacklist = /[^\x22,\-\.0-9:A-Z\[\x5C\]_a-z{}]/g;
	const cdataClose = /\]\](?:>|\\x3E|\\u003E)/gi;
	return (
		JSON.stringify( value )
			.replace( jsonInHtmlBlacklist, jsSlashEncoder )
			// prevent breaking out of CDATA context.  Escaping < below is sufficient
			// to prevent opening a CDATA context.
			.replace( cdataClose, '\\x5D\\x5D\\x3E' )
	);
};
