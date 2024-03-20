export type CharacterPoolOptions = {
	/**
	 * Define the length of the generated random password
	 */
	length: number;
	/**
	 * Use digits 0-9 in the character pool
	 */
	useNumbers: boolean;
	/**
	 * Use characters !@#$%^&*() in the character pool
	 */
	useSpecialChars: boolean;
	/**
	 * Use characters -_ []{}<>~`+=,.;:/?| in the character pool
	 */
	useExtraSpecialChars: boolean;
};

export const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const DIGITS = '0123456789';
export const SPECIAL_CHARS = '!@#$%^&*()';
export const EXTRA_SPECIAL_CHARS = '-_ []{}<>~`+=,.;:/?|';

/**
 * Forked from https://github.com/WordPress/wporg-two-factor/blob/11597d28228d599f9fafe6f69a81375569f6d0e7/settings/src/components/password.js#L139-L167
 *
 * Generate a cryptographically secure random password.
 */
export function generatePassword( {
	length = 24,
	useNumbers = true,
	useSpecialChars = true,
	useExtraSpecialChars = false,
}: Partial< CharacterPoolOptions > = {} ) {
	let characterPool = ALPHABET;

	if ( useNumbers ) {
		characterPool += DIGITS;
	}

	if ( useSpecialChars ) {
		characterPool += SPECIAL_CHARS;
	}

	if ( useExtraSpecialChars ) {
		characterPool += EXTRA_SPECIAL_CHARS;
	}

	const randomNumber = new Uint8Array( 1 );
	let password = '';

	// JS doesn't provide a way to generate cryptographically secure random number within a range, so instead
	// we just throw out values that don't correspond to a character. This is a little bit slower than using a
	// modulo operation, but it avoids introducing bias in the distribution. Realistically, it's easily performant
	// in this context.
	// @link https://dimitri.xyz/random-ints-from-random-bits/
	for ( let i = 0; i < length; i++ ) {
		do {
			globalThis.crypto.getRandomValues( randomNumber );
		} while ( randomNumber[ 0 ] >= characterPool.length );

		password += characterPool[ randomNumber[ 0 ] ];
	}

	return password;
}
