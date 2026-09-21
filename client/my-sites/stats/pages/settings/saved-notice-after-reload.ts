const STORAGE_KEY = 'jetpack-stats-settings-saved';

/**
 * Ask the next page load to show the "Settings saved." notice.
 */
export function showSavedNoticeAfterReload() {
	try {
		window.sessionStorage.setItem( STORAGE_KEY, '1' );
	} catch {
		// Without storage the page still reloads with the new setting, only without the notice.
	}
}

/**
 * Whether the page load before this one asked for the notice. The request is cleared, so it answers true once.
 */
export function takeSavedNoticeRequest(): boolean {
	try {
		const isRequested = window.sessionStorage.getItem( STORAGE_KEY ) === '1';
		window.sessionStorage.removeItem( STORAGE_KEY );
		return isRequested;
	} catch {
		return false;
	}
}
