/**
 * Checks if the block notes feature should be enabled.
 *
 * This function returns true if the feature is enabled via
 * `window.bigSkyBlockNotes.enabled`, set by the Block Notes PHP enqueue.
 * Matches Image Studio's pattern (`window.bigSkyImageStudio.enabled`).
 *
 * @returns {boolean} Whether the block notes feature should be enabled
 */
export function areBlockNotesEnabled(): boolean {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	return !! window.bigSkyBlockNotes?.enabled;
}
