/**
 * Get reader last path selected
 * @param state redux state
 * @returns string|null {lastPath} last feed path visited in the reader
 */
export function getLastPath( state ) {
	return state.readerUi.lastPath;
}
