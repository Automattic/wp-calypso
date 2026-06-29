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

/**
 * Get last reader action that requires user to be logged in
 * @param state redux state
 * @returns string|null {loggedInAction} logged in action clicked in the reader
 */
export function getPersistedLastActionPriorToLogin( state ) {
	// Check if lastActionRequiresLogin is defined, if not return null
	if ( ! state.readerUi?.persistedLastActionPriorToLogin ) {
		return null;
	}
	return state.readerUi?.persistedLastActionPriorToLogin;
}

/**
 * Selector to check if the reader multi-site version of the reader dashboard is enabled
 *
 * The dashboard omnibar replaced the Reader multi-site dashboard, which is now
 * disabled. The remaining MSD wiring is unused and tracked for removal separately.
 * @returns {boolean} Whether the user is enabled for the reader multi-site dashboard
 */
export function isReaderMSDEnabled() {
	return false;
}
