const BASE62_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Convert a base 10 integer to a base 62 string.
 * @param num - The base 10 integer to convert.
 * @returns The base 62 string representation of the number.
 */
function base10ToBase62( num: number ) {
	let result = '';

	while ( num > 0 ) {
		result = BASE62_ALPHABET[ num % 62 ] + result;
		num = Math.floor( num / 62 );
	}

	return result || '0';
}

/**
 * Create a two-character long alphanumerical unique session ID.
 * Two characters is short enough to not be ugly and create accidental offensive words, but long enough to contain 3782 enumerations.
 */
export function createSessionId() {
	const minNumberForTwoLettersBase62 = 62;
	const maxNumberForTwoLettersBase62 = 3844;
	const seed =
		minNumberForTwoLettersBase62 + Math.floor( Math.random() * maxNumberForTwoLettersBase62 );

	return base10ToBase62( seed );
}
