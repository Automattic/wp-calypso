/**
 * Internal dependencies
 */
import {
	JETPACK_CREDENTIALS_RECEIVE,
	JETPACK_CREDENTIALS_REQUEST,
	JETPACK_CREDENTIALS_REQUEST_FAILURE,
	JETPACK_CREDENTIALS_REQUEST_SUCCESS,
	JETPACK_CREDENTIALS_UPDATE,
	JETPACK_CREDENTIALS_UPDATE_FAILURE,
	JETPACK_CREDENTIALS_UPDATE_SUCCESS
} from 'state/action-types';
import wp from 'lib/wp';

/**
 * Fetch the Jetpack credentials for a certain site.
 *
 * @param  {Int}      siteId      ID of the site.
 * @return {Function}             Action thunk to fetch the Jetpack credentials when called.
 */
export const fetchCredentials = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_CREDENTIALS_REQUEST,
			siteId
		} );

		return wp.undocumented().fetchJetpackCredentials( siteId )
			.then( ( response ) => {
				const credentials = response.credentials || {};
				dispatch( {
					type: JETPACK_CREDENTIALS_RECEIVE,
					siteId,
					credentials
				} );
				dispatch( {
					type: JETPACK_CREDENTIALS_REQUEST_SUCCESS,
					siteId
				} );
			} ).catch( error => {
				dispatch( {
					type: JETPACK_CREDENTIALS_REQUEST_FAILURE,
					siteId,
					error: error.message
				} );
			} );
	};
};

/**
 * Update the Jetpack credentials for a certain site.
 *
 * @param  {Int}      siteId      ID of the site.
 * @param  {Object}   credentials New credentials.
 * @return {Function}             Action thunk to update the Jetpack credentials when called.
 */
export const updateCredentials = ( siteId, credentials ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_CREDENTIALS_UPDATE,
			siteId,
			credentials
		} );

		return wp.undocumented().updateJetpackCredentials( siteId, credentials )
			.then( () => {
				dispatch( {
					type: JETPACK_CREDENTIALS_UPDATE_SUCCESS,
					siteId,
					credentials
				} );
			} ).catch( ( error ) => {
				dispatch( {
					type: JETPACK_CREDENTIALS_UPDATE_FAILURE,
					siteId,
					credentials,
					error: error.message
				} );
			} );
	};
};
