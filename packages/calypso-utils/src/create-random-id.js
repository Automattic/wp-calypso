/**
 * External dependencies
 */
import { times } from 'lodash';

export function createRandomId( randomBytesLength = 9 ) {
	// 9 * 4/3 = 12
	// this is to avoid getting padding of a random byte string when it is base64 encoded
	let randomBytes;

	if ( window.crypto && window.crypto.getRandomValues ) {
		randomBytes = new Uint8Array( randomBytesLength );
		window.crypto.getRandomValues( randomBytes );
	} else {
		randomBytes = times( randomBytesLength, () => Math.floor( Math.random() * 256 ) );
	}

	return window.btoa( String.fromCharCode.apply( String, randomBytes ) );
}
