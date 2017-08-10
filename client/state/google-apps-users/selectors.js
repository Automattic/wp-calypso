/** @format */
/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

function getGoogleAppsUsersState( state ) {
	return state.googleAppsUsers;
}

function createGoogleAppsUsersSelector( fn ) {
	return createSelector( fn, state => [ getGoogleAppsUsersState( state ) ] );
}

/**
 * Filters user by a domain
 * @param {{}} state
 * @param {string} domainName
 * @returns {[]} Filtered users
 */
export const getByDomain = createGoogleAppsUsersSelector( ( state, domainName ) =>
	getGoogleAppsUsersState( state ).items.filter( item => item.domain === domainName )
);

/**
 * Filters user by a site id
 * @param {{}} state
 * @param {number} A site ID
 * @returns {[]} Filtered users
 */
export const getBySite = createGoogleAppsUsersSelector( ( state, siteId ) =>
	getGoogleAppsUsersState( state ).items.filter( item => item.site_id === siteId )
);

/**
 * Returns whether we have loaded some data. Always false when fetching data
 * @param {{}} state - Previous state
 * @returns {boolean} - Whether we loaded some data or not
 */
export function isLoaded( state ) {
	return getGoogleAppsUsersState( state ).loaded;
}
