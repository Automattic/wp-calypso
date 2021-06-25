/**
 * Internal dependencies
 */
import 'calypso/state/reader-ui/init';

/**
 * Whether or not a specific reader organization sidebar item is open
 *
 * @param state redux state
 * @param organizationId given org id
 * @returns {boolean} whether or not the sidebar item is open
 */
export function isOrganizationOpen( state, organizationId ) {
	const openOrganizations = state.readerUi.sidebar.openOrganizations;
	if ( openOrganizations.indexOf( organizationId ) > -1 ) {
		return true;
	}
	return false;
}

/**
 * Whether or not following reader sidebar item is open
 *
 * @param state redux state
 * @returns {boolean} whether or not the sidebar item is open
 */
export function isFollowingOpen( state ) {
	return state.readerUi.sidebar.isFollowingOpen;
}

/**
 * Whether or not lists reader sidebar item is open
 *
 * @param state redux state
 * @returns {boolean} whether or not the sidebar item is open
 */
export function isListsOpen( state ) {
	return state.readerUi.sidebar.isListsOpen;
}

/**
 * Whether or not tags reader sidebar item is open
 *
 * @param state redux state
 * @returns {boolean} whether or not the sidebar item is open
 */
export function isTagsOpen( state ) {
	return state.readerUi.sidebar.isTagsOpen;
}
