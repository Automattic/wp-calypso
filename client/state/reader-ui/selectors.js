/**
 * Get reader last path selected
 * @param state redux state
 * @returns string|null {lastPath} last feed path visited in the reader
 */
export function getLastPath( state ) {
	return state.readerUi.lastPath;
}

/**
 * Get last reader action that requires user to be logged in
 * @param state redux state
 * @returns string|null {loggedInAction} logged in action clicked in the reader
 */
export function getLastActionRequiresLogin( state ) {
	// Check if lastActionRequiresLogin is defined, if not return null
	if ( ! state.readerUi?.lastActionRequiresLogin ) {
		return null;
	}
	return state.readerUi?.lastActionRequiresLogin;
}
