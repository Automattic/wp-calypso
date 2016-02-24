function getGoogleAppsUsersState( state ) {
	return state.googleAppsUsers;
}

export function getByDomain( state, domain ) {
	return getGoogleAppsUsersState( state ).items.filter( item => item.domain === domain );
}

export function getBySite( state, siteId ) {
	return getGoogleAppsUsersState( state ).items.filter( item => item.site_id === siteId );
}

export function getAll( state ) {
	return getGoogleAppsUsersState( state );
}

export function getLoaded( state ) {
	return getGoogleAppsUsersState( state ).loaded;
}
