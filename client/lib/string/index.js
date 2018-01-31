/** @format */
/**
 * Are two strings equal, when ignoring whitespace and case?
 *
 * @export
 * @param {string} a the first string
 * @param {string} b the second string
 * @returns
 */
export function areEqualIgnoringWhitespaceAndCase( a, b ) {
	if ( ! a || ! b ) {
		return false;
	}

	a = a.replace( /[\s'.\-_"]/g, '' );
	b = b.replace( /[\s'.\-_"]/g, '' );
	return a.toLowerCase() === b.toLowerCase();
}
