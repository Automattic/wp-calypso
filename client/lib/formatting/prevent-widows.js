/**
 * External dependencies
 */
import React from 'react';

/**
 * Prevent widows by replacing spaces between the last `wordsToKeep` words in the text with non-breaking spaces
 *
 * @param  {string|@i18n-calypso/TranslateResult} text the text to work on
 * @param  {number} wordsToKeep the number of words to keep together
 * @returns {string}             the widow-prevented string
 */
export function preventWidows( text, wordsToKeep = 2 ) {
	return preventWidowsInPart(
		'string' === typeof text ? text.trim() : text,
		Math.max( 1, wordsToKeep - 1 )
	).part;
}

const reverseSpaceRegex = /\s+(\S*)$/;

/**
 * The helper function to preventWidows that calls itself recursively searching for spaces to substitute with
 * non-breaking spaces.
 *
 * @param {string|@i18n-calypso/TranslateResult} part The section of the content to search, a string or a component
 *     or an array of strings and components
 * @param {number} spacesToSubstitute The number of spaces to substitute with non-breaking spaces. This is one less than the preventWidows wordsToKeep
 * @returns object Contains two keys `part` the possibly modified `part` parameter passed in, and `substituted` the number of spaces substituted.
 */
function preventWidowsInPart( part, spacesToSubstitute ) {
	let substituted = 0;

	if ( 'string' === typeof part && part.length > 0 ) {
		let text = part;
		let retVal = '';

		// If the part is a string, work from the right looking for spaces
		// TODO Work out if we can tell that this is a RTL language, and if it's appropriate to join words in this way
		while ( substituted < spacesToSubstitute && reverseSpaceRegex.test( text ) ) {
			const match = reverseSpaceRegex.exec( text );
			retVal = '\xA0' + match[ 1 ] + retVal;
			text = text.replace( reverseSpaceRegex, '' );
			substituted++;
		}
		retVal = text + retVal;
		// Return the modified string and the number of spaces substituted
		return { part: retVal, substituted };
	}

	/* If we're called with an array construct a copy of the array by calling
	 * ourself on each element until we have substituted enough spaces. Then
	 * concatentate the rest of the array
	 */
	if ( Array.isArray( part ) && part.length > 0 ) {
		let elements = [];
		let idx = part.length - 1;
		while ( substituted < spacesToSubstitute && idx >= 0 ) {
			const result = preventWidowsInPart( part[ idx ], spacesToSubstitute - substituted );
			elements.unshift( result.part );
			substituted += result.substituted;
			idx--;
		}
		elements = part.slice( 0, idx + 1 ).concat( elements );
		return { part: elements, substituted };
	}

	/* If we're called with a component, and it has children
	 * then call ourself with the value of the children prop
	 * (an array that will be handled above)
	 *
	 * Then return a cloned component with the possibly modified
	 * children, along with the tally of substituted spaces.
	 */
	if ( React.isValidElement( part ) && part.props.children ) {
		const result = preventWidowsInPart( part.props.children, spacesToSubstitute );
		if ( result.substituted > 0 ) {
			return {
				part: React.cloneElement( part, part.props, result.part ),
				substituted: result.substituted,
			};
		}
		return { part, substituted };
	}

	// For anything else e.g. an element without children, there's nothing to do.
	return { part, substituted };
}
