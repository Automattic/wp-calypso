/**
 * Checks if AI Block Notes should be enabled.
 *
 * New hosts set `window.aiBlockNotesData`; `window.blockNotesData` remains a
 * compatibility reader for Jetpack versions released before the rename.
 *
 * @returns {boolean} Whether AI Block Notes should be enabled.
 */
export function isAiBlockNotesEnabled(): boolean {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	return !! ( window.aiBlockNotesData ?? window.blockNotesData )?.enabled;
}
