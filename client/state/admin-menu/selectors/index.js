import 'calypso/state/admin-menu/init';
import { isJetpackSite } from 'calypso/state/sites/selectors';

export function getAdminMenu( state, siteId ) {
	const stateSlice = state?.adminMenu?.menus;

	if ( ! stateSlice || ! siteId ) {
		return null;
	}

	if ( isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } ) ) {
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
