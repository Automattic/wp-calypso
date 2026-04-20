/**
 * Minimal Agenttic tracking helpers used by Image Studio.
 */

/**
 * Formats suggestion IDs as a pipe-delimited string.
 * @param suggestions - Array of suggestions with id property.
 * @returns Pipe-delimited suggestion ids (e.g. '|id1|id2|').
 */
export function formatSuggestionIds( suggestions: Array< { id?: string } > ): string {
	if ( ! suggestions || suggestions.length === 0 ) {
		return '||';
	}

	return `|${ suggestions.map( ( suggestion ) => suggestion.id ?? '' ).join( '|' ) }|`;
}
