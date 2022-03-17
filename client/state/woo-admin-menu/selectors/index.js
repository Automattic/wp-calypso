import 'calypso/state/woo-admin-menu/init';

export function getWooAdminMenu( state, siteId ) {
	const stateSlice = state?.wooAdminMenu?.menus;

	if ( ! stateSlice || ! siteId ) {
		return null;
	}

	return state.wooAdminMenu.menus[ siteId ] || null;
}

export function getIsRequestingWooAdminMenu( state ) {
	const stateSlice = state?.wooAdminMenu?.requesting;

	if ( ! stateSlice ) {
		return null;
	}

	return state.wooAdminMenu.requesting;
}
