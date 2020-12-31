/**
 * WordPress dependencies
 */

import { parse, synchronizeBlocksWithTemplate } from '@wordpress/blocks';

/** @typedef {import('../../store/editor/reducer').Pattern} Pattern */

const getPattern = ( patterns, currentPattern ) =>
	patterns && patterns.find( ( item ) => item.name === currentPattern );

/**
 * Get the pattern to start an editor with.
 *
 * @param {Pattern[]} patterns Array of patterns
 * @param {string} currentPattern Current pattern name
 * @param {object[]} template Current template
 * @param {object[]} initialContent Initial content
 */
function getInitialEditorContent( patterns, currentPattern, template, initialContent ) {
	// No patterns = do nothing
	if ( patterns === undefined ) {
		return initialContent;
	}

	// Existing content comes before anything
	if ( initialContent && initialContent.length > 0 ) {
		return initialContent;
	}

	// Did we load the page with a template set?
	if ( currentPattern ) {
		const pattern = getPattern( patterns, currentPattern );

		if ( pattern ) {
			return parse( pattern.content );
		}
	}

	if ( template ) {
		return synchronizeBlocksWithTemplate( initialContent, template );
	}

	// No content
	return [];
}

export default getInitialEditorContent;
