import { isEnabled } from '@automattic/calypso-config';

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
 * Temporary selector to check if the reader multi-site version of the reader dashboard is enabled
 * @returns {boolean} Whether the user is enabled for the reader multi-site dashboard
 */
export function isReaderMSDEnabled() {
	// For now it is not using the state, but future implementations might need to use it to check if the user opted into the dashboard/v2
	// Regardless of the feature flag state
	return isEnabled( 'reader/msd-enabled' ) && isEnabled( 'dashboard/v2' );
}
