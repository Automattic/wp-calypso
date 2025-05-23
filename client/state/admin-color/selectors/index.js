import 'calypso/state/admin-color/init';

export function getAdminColor( state, siteId ) {
	return state?.adminColor?.[ siteId ] || null;
}

export function isFetchingAdminColor( state, siteId ) {
	return ! state?.adminColor?.[ siteId ];
}
