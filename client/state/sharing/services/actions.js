/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import {
	KEYRING_SERVICES_RECEIVE,
	KEYRING_SERVICES_REQUEST,
	KEYRING_SERVICES_REQUEST_FAILURE,
	KEYRING_SERVICES_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import 'calypso/state/sharing/init';

/**
 * Triggers a network request for Keyring services.
 *
 * @returns {Function} Action thunk
 */
export function requestKeyringServices() {
	return ( dispatch, getState ) => {
		dispatch( {
			type: KEYRING_SERVICES_REQUEST,
		} );

		const siteId = getSelectedSiteId( getState() );
		return wpcom
			.undocumented()
			.sitesExternalServices( siteId )
			.then( ( response ) => {
				dispatch( {
					type: KEYRING_SERVICES_RECEIVE,
					services: response.services,
				} );
				dispatch( {
					type: KEYRING_SERVICES_REQUEST_SUCCESS,
				} );
			} )
			.catch( ( error ) =>
				dispatch( {
					type: KEYRING_SERVICES_REQUEST_FAILURE,
					error,
				} )
			);
	};
}
