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
	return ( dispatch ) => {
		dispatch( {
			type: KEYRING_SERVICES_REQUEST,
		} );

		return wpcom.undocumented().metaKeyring()
			.then( ( services ) => {
				dispatch( receiveKeyringServices( services ) );
				dispatch( successKeyringServicesRequest() );
			} )
			.catch( ( error ) => dispatch( failKeyringServicesRequest( error ) ) );
	};
}

/**
 * Returns an action object to be used in signalling that a network request for
 * Keyring services has been received.
 *
 * @param  {Object} services Keyring services
 * @return {Object}          Action object
 */
export function receiveKeyringServices( services ) {
	return {
		type: KEYRING_SERVICES_RECEIVE,
		services
	};
}

/**
 * Returns an action object to be used in signalling that a network request for
 * Keyring services has succeeded.
 *
 * @return {Object} Action object
 */
export function successKeyringServicesRequest() {
	return {
		type: KEYRING_SERVICES_REQUEST_SUCCESS,
	};
}

/**
 * Returns an action object to be used in signalling that a network request for
 * Keyring services has failed.
 *
 * @param  {Object} error API response error
 * @return {Object}       Action object
 */
export function failKeyringServicesRequest( error ) {
	return {
		type: KEYRING_SERVICES_REQUEST_FAILURE,
		error
	};
}
