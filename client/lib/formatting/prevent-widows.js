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
	return preventWidowsInPart( text, Math.max( 1, wordsToKeep - 1 ) ).part;
}

const reverseSpaceRegex = /\s+(\S*)$/;

function preventWidowsInPart( part, spacesToSubstitute ) {
	let substituted = 0;

	if ( 'string' === typeof part ) {
		let text = part;
		while ( substituted < spacesToSubstitute && text.match( reverseSpaceRegex ) ) {
			text = text.replace( reverseSpaceRegex, '\xA0$1' ); //
			substituted++;
		}
		return { part: text, substituted };
	}

	if ( Array.isArray( part ) ) {
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

	// Shouldn't get here, but just in case! Should this throw an exception?
	return { part, substituted };
}
