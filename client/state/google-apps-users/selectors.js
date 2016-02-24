import createSelector from 'lib/create-selector';

function getGoogleAppsUsersState( state ) {
	return state.googleAppsUsers;
}

function createGoogleAppsUsersSelector( fn ) {
	return createSelector( fn, ( state ) => [ getGoogleAppsUsersState( state ) ] );
}

export const getByDomain = createGoogleAppsUsersSelector(
	( state, domainName ) => getGoogleAppsUsersState( state ).items.filter( item => item.domain === domainName )
);

export const getBySite = createGoogleAppsUsersSelector(
	( state, siteId ) => getGoogleAppsUsersState( state ).items.filter( item => item.site_id === siteId )
);

export function getLoaded( state ) {
	return getGoogleAppsUsersState( state ).loaded;
}
