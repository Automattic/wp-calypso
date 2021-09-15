import 'calypso/state/admin-menu/init';
import { isEnabled } from '@automattic/calypso-config';

export function getAdminMenu( state, siteId ) {
	const stateSlice = state?.adminMenu?.menus;

	if ( ! stateSlice || ! siteId ) {
		return null;
	}

	const allAdminMenu = state.adminMenu.menus[ siteId ] || null;
	const filteredAdminMenu = allAdminMenu?.filter( ( t ) => t.slug !== 'httpswordpress-cominbox' );
	const enableMailbox = isEnabled( 'sidebar/inbox' );

	return enableMailbox ? allAdminMenu : filteredAdminMenu;
}

export function getIsRequestingAdminMenu( state ) {
	const stateSlice = state?.adminMenu?.requesting;

	if ( ! stateSlice ) {
		return null;
	}

	return state.adminMenu.requesting;
}
