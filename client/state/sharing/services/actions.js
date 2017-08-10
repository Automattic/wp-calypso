/** @format */
/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	KEYRING_SERVICES_RECEIVE,
	KEYRING_SERVICES_REQUEST,
	KEYRING_SERVICES_REQUEST_FAILURE,
	KEYRING_SERVICES_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Triggers a network request for Keyring services.
 *
 * @return {Function} Action thunk
 */
export function requestKeyringServices() {
	return dispatch => {
		dispatch( {
			type: KEYRING_SERVICES_REQUEST,
		} );

		return wpcom
			.undocumented()
			.metaKeyring()
			.then( response => {
				dispatch( {
					type: KEYRING_SERVICES_RECEIVE,
					services: response.services,
				} );
				dispatch( {
					type: KEYRING_SERVICES_REQUEST_SUCCESS,
				} );
			} )
			.catch( error =>
				dispatch( {
					type: KEYRING_SERVICES_REQUEST_FAILURE,
					error,
				} )
			);
	};
}
