/**
 * Internal dependencies
 */
import 'calypso/state/admin-menu/init';

export function getAdminMenu( state, siteId ) {
	const stateSlice = state?.adminMenu?.menus;

	if ( ! stateSlice || ! siteId ) {
		return null;
	}

	return state.adminMenu.menus[ siteId ] || null;
}

export function getIsRequestingAdminMenu( state ) {
	const stateSlice = state?.adminMenu?.requesting;

	if ( ! stateSlice ) {
		return null;
	}

	return state.adminMenu.requesting;
}

/**
 * Returns whether the previous request to save or retrieve the preferences, failed.
 *
 * @param {state} state State object
 */
export function hasAdminMenuRequestFailed( state ) {
	return state.adminMenu.failed;
}
