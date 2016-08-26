/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

function getGoogleAppsProvisionState( state ) {
	return state.googleAppsProvisionData;
}

function createGoogleAppsProvisionDataSelector( fn ) {
	return createSelector( fn, ( state ) => [ getGoogleAppsProvisionState( state ) ] );
}

/**
 * Filters user by a domain
 * @param {{}} state
 * @returns {[]} Provisioning Data
 */
export const getProvisionDataByDomain = createGoogleAppsProvisionDataSelector(
	( state ) => getGoogleAppsProvisionState( state )
);

/**
 * Returns whether we have loaded some data. Always false when fetching data
 * @param {{}} state - Previous state
 * @returns {boolean} - Whether we loaded some data or not
 */
export function provisionDataIsLoaded( state ) {
	return getGoogleAppsProvisionState( state ).loaded;
}
