// inspired from https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_random
const randomInt = ( lower, upper ) => Math.floor( lower + Math.random() * ( upper - lower + 1 ) );

// inspired from https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_sample
const sample = ( arr ) =>
	arr.length ? arr[ Math.floor( Math.random() * arr.length ) ] : undefined;

const LETTER_CHARSETS = [
	'abcdefghjkmnpqrstuvwxyz'.split( '' ),
	'ABCDEFGHJKMNPQRSTUVWXYZ'.split( '' ),
];

const CHARSETS = [ ...LETTER_CHARSETS, '23456789'.split( '' ), '!@#$%^&*'.split( '' ) ];

export const generatePassword = function () {
	const length = randomInt( 12, 35 );
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
