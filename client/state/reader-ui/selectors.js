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
export function getLastLoggedInAction( state ) {
	return state.readerUi.lastLoggedInAction;
}
