const EXCERPT_MAX_LENGTH = 140;

/**
 * Collapses brief text into a single-line excerpt for the deliverable card
 * description.
 * @param text - The raw brief text.
 * @returns A trimmed, single-line excerpt.
 */
export function getBriefExcerpt( text: string ): string {
	const collapsed = text.replace( /\s+/g, ' ' ).trim();

	if ( collapsed.length <= EXCERPT_MAX_LENGTH ) {
		return collapsed;
	}

	return `${ collapsed.slice( 0, EXCERPT_MAX_LENGTH ).trimEnd() }…`;
}
