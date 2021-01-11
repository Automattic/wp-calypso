/**
 * External dependencies
 */

import { random, sample } from 'lodash';

export const LETTER_CHARSETS = {
	lowerChars: 'abcdefghjkmnpqrstuvwxyz'.split( '' ),
	upperChars: 'ABCDEFGHJKMNPQRSTUVWXYZ'.split( '' ),
};

export const CHARSETS = {
	...LETTER_CHARSETS,
	digitChars: '23456789'.split( '' ),
	specialChars: '!@#$%^&*'.split( '' ),
};

export const generatePassword = function () {
	const length = random( 12, 35 );
	const chars = Object.keys( CHARSETS ).map( ( charset ) => {
		return sample( CHARSETS[ charset ] );
	} );

	for ( let i = 0; i < length; i++ ) {
		if ( 0 === i % 4 ) {
			chars.push( sample( sample( LETTER_CHARSETS ) ) );
		} else {
			// Get a random character from a random character set
			chars.push( sample( sample( CHARSETS ) ) );
		}
	}

	return chars.join( '' );
};
