import 'calypso/state/admin-color/init';

export function getAdminColor( state, siteId ) {
	return state?.adminColor?.[ siteId ] || null;
}
