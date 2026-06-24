/**
 * Checks if the content research feature should be enabled.
 *
 * Returns true if the feature is enabled via `window.contentResearchData.enabled`,
 * set by the Content Research PHP enqueue.
 */
export function isContentResearchEnabled(): boolean {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	return !! window.contentResearchData?.enabled;
}
