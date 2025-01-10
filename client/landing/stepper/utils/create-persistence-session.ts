/**
 * Convert a base 10 integer to a base 62 string.
 * @param num - The base 10 integer to convert.
 * @returns The base 62 string representation of the number.
 */
function base10ToBase62( num: number ) {
	const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let result = '';

	while ( num > 0 ) {
		result = chars[ num % 62 ] + result;
		num = Math.floor( num / 62 );
	}

	return result || '0';
}

/**
 * Create a short alphanumerical unique session id based on the current time. This ID is only unique for one browser.
 */
export function createSessionId() {
	const secondOfDay =
		new Date().getMinutes() * 60 + new Date().getSeconds() + Math.floor( Math.random() * 1000 );

	return base10ToBase62( secondOfDay );
}
