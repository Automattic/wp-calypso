const STORAGE_KEY = 'jetpack-stats-settings-saved';

// Session storage lives as long as the tab, so an old request from a reload that never finished must not show the notice later.
const REQUEST_LIFETIME_MS = 30 * 1000;

/**
 * Ask the next page load to show the "Settings saved." notice.
 */
export function showSavedNoticeAfterReload() {
	try {
		window.sessionStorage.setItem( STORAGE_KEY, String( Date.now() ) );
	} catch {
		// Without storage the page still reloads with the new setting, only without the notice.
	}
}

/**
 * Whether a page load in the last 30 seconds asked for the notice. The request is cleared, so it answers true once.
 */
export function takeSavedNoticeRequest(): boolean {
	try {
		const requestedAt = Number( window.sessionStorage.getItem( STORAGE_KEY ) );
		window.sessionStorage.removeItem( STORAGE_KEY );
		return Date.now() - requestedAt < REQUEST_LIFETIME_MS;
	} catch {
		return false;
	}
}
