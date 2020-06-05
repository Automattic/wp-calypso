/**
 * Wheter or not a specific reader organization sidebar item is open
 *
 * @param state redux state
 * @param organizationId given org id
 * @returns {boolean} whether or not the sidebar item is open
 */
export function isOrganizationOpen( state, organizationId ) {
	const openOrganizations = state.ui.reader.sidebar.openOrganizations;
	if ( openOrganizations.indexOf( organizationId ) > -1 ) {
		return true;
	}
	return false;
}

/**
 * Wheter or not following reader sidebar item is open
 *
 * @param state redux state
 * @returns {boolean} whether or not the sidebar item is open
 */
export function isFollowingOpen( state ) {
	return state.ui.reader.sidebar.isFollowingOpen;
}
