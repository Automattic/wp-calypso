/**
 * Are two strings equal, when ignoring whitespace and case?
 * @param {string} a the first string
 * @param {string} b the second string
 */
export function areEqualIgnoringWhitespaceAndCase( a: string, b: string ) {
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

export function getFirstGrapheme( input: string ) {
	if ( 'Segmenter' in Intl ) {
		const segmenter = new Intl.Segmenter();
		const [ firstSegmentData ] = segmenter.segment( input );

		return firstSegmentData?.segment ?? '';
	}

	const codePoint = input.codePointAt( 0 );
	if ( codePoint ) {
		return String.fromCodePoint( codePoint );
	}
	return '';
}
