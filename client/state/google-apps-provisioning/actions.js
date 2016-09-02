/**
 * Internal Dependencies
 */
import wp from 'lib/wp';
import {
	GOOGLE_APPS_PROVISIONING_FETCH,
	GOOGLE_APPS_PROVISIONING_FETCH_COMPLETED,
	GOOGLE_APPS_PROVISIONING_FETCH_FAILED,
	GOOGLE_APPS_PROVISIONING_UPDATE,
	GOOGLE_APPS_PROVISIONING_UPDATE_SUCCESS,
	GOOGLE_APPS_PROVISIONING_UPDATE_FAILED
} from 'state/action-types';

const wpcom = wp.undocumented();

/**
 * Fetches Google Apps provisoning data by domain
 * @param {string} domain - Domain to fetch for
 * @returns {Function} - Wrapped function that accepts `dispatch`
 */
export function fetchGoogleAppsProvisionData( domain ) {
	return ( dispatch ) => {
		dispatch( {
			type: GOOGLE_APPS_PROVISIONING_FETCH,
			domain
		} );

		return wpcom.googleAppsProvisioning( domain ).then( data => {
			dispatch( {
				type: GOOGLE_APPS_PROVISIONING_FETCH_COMPLETED,
				data: data
			} );
		}, ( error ) => {
			dispatch( {
				type: GOOGLE_APPS_PROVISIONING_FETCH_FAILED,
				error
			} );
		} );
	};
}

/**
 * Updates the provisioning data for Google Apps.
 * @param {String} domain                           Domain to update
 * @param {String} data.name                        Name of the user
 * @param {String} data.organization                Name of the organization
 * @param {Number} data.zip                         Zip code for the account
 * @param {String} data.country                     Country for the account
 * @param {boolean} data.is_provisioned             Is the account already provisioned
 * @returns {Function}                              Action thunk
 */
export function updateGoogleAppsProvisionData( domain, data ) {
	return ( dispatch ) => {
		dispatch( {
			type: GOOGLE_APPS_PROVISIONING_UPDATE,
			data: data
		} );

		return wpcom.updateGoogleAppsProvisioning( domain, data ).then( ( result ) => {
			dispatch( {
				type: GOOGLE_APPS_PROVISIONING_UPDATE_SUCCESS,
				result: result
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: GOOGLE_APPS_PROVISIONING_UPDATE_FAILED,
				error
			} );
		} );
	};
}
