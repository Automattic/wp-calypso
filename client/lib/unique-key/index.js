/**
 * External dependencies
 */

/**
* Internal Dependencies
*/

/**
* Generate a random key of given length, this function works best when passed a
* length that's a multiple of 4.
*
* @export
* @param {int} len length of the key requested
* @returns {string} an URL safe random string
*/
export function generateKeyOfLen( len ) {
	const randomBytesLength = Math.ceil( len * 3/4 );
	let i, randomBytes = [];

	if ( window && window.crypto && window.crypto.getRandomValues ) {
		randomBytes = new Uint8Array( randomBytesLength );
		window.crypto.getRandomValues( randomBytes );
	} else {
		for ( i = 0; i < randomBytesLength; ++i ) {
			randomBytes[ i ] = Math.floor( Math.random() * 256 );
		}
	}

	return window
		.btoa( String.fromCharCode.apply( String, randomBytes ) )
		.replace( /\+/g, '-' )
		.replace( /\//g, '_' )
		.substring( 0, len );
}
