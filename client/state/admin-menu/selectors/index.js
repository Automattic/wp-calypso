/**
 * Internal dependencies
 */
import 'state/admin-menu/init';

export function getAdminMenu( state, siteId ) {
	const stateSlice = state?.adminMenu;

	if ( ! stateSlice || ! siteId ) {
		return null;
	}

	return state.adminMenu[ siteId ] || null;
}
