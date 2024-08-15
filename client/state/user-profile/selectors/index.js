import 'calypso/state/user-profile/init';

export function getAdminColor( state, siteId ) {
	return state?.userProfile?.[ siteId ]?.admin_color || null;
}

export function getLocale( state, siteId ) {
	return state?.userProfile?.[ siteId ]?.locale || null;
}
