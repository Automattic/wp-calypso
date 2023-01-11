export type CharacterPoolOptions = {
	/**
	 * Define the length of the generated random password
	 */
	length?: number;
	/**
	 * Use digits 0-9 in character pool
	 */
	useNumbers?: boolean;
	/**
	 * Use characters !@#$%^&*() in character pool
	 */
	useSpecialChars?: boolean;
	/**
	 * Use characters -_ []{}<>~`+=,.;:/?| in character pool
	 */
	useExtraSpecialChars?: boolean;
};

/**
 * Forked from https://github.com/WordPress/wporg-two-factor/blob/trunk/settings/src/components/password.js#L139-L167
 *
 * Generate a cryptographically secure random password.
 */
export function generatePassword( {
	length = 24,
	useNumbers = true,
	useSpecialChars = true,
	useExtraSpecialChars = false,
}: CharacterPoolOptions = {} ) {
	let characterPool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

	if ( useNumbers ) {
		characterPool += '0123456789';
	}

	if ( useSpecialChars ) {
		characterPool += '!@#$%^&*()';
	}

	if ( useExtraSpecialChars ) {
		characterPool += '-_ []{}<>~`+=,.;:/?|';
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
			window.crypto.getRandomValues( randomNumber );
		} while ( randomNumber[ 0 ] >= characterPool.length );

		password += characterPool[ randomNumber[ 0 ] ];
	}

	return password;
}
