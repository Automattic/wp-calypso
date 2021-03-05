/**
 * Are two strings equal, when ignoring whitespace and case?
 *
 * @export
 * @param {string} a the first string
 * @param {string} b the second string
 * @returns
 */
export function areEqualIgnoringWhitespaceAndCase( a, b ) {
	// Are they equal without any manipulation?
	if ( a === b ) {
		return true;
	}

	// If we don't have strings for this part, bail out
	if ( ! a || ! b ) {
		return false;
	}

	a = a.replace( /[\s'.\-_"]/g, '' );
	b = b.replace( /[\s'.\-_"]/g, '' );
	return a.toLowerCase() === b.toLowerCase();
}
