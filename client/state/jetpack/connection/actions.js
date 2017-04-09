/**
 * Internal dependencies
 */
import {
	JETPACK_CONNECTION_STATUS_RECEIVE,
	JETPACK_CONNECTION_STATUS_REQUEST,
	JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS,
	JETPACK_CONNECTION_STATUS_REQUEST_FAILURE,
	JETPACK_DISCONNECT_RECEIVE,
	JETPACK_DISCONNECT_REQUEST,
	JETPACK_DISCONNECT_REQUEST_FAILURE,
	JETPACK_DISCONNECT_REQUEST_SUCCESS,
} from 'state/action-types';
import wp from 'lib/wp';

export const requestJetpackConnectionStatus = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_CONNECTION_STATUS_REQUEST,
			siteId
		} );

		return wp.undocumented().getJetpackConnectionStatus( siteId )
			.then( ( response ) => {
				dispatch( {
					type: JETPACK_CONNECTION_STATUS_RECEIVE,
					siteId,
					status: response.data
				} );
				dispatch( {
					type: JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS,
					siteId
				} );
			} ).catch( error => {
				dispatch( {
					type: JETPACK_CONNECTION_STATUS_REQUEST_FAILURE,
					siteId,
					error: error.message
				} );
			} );
	};
};

export const disconnect = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_DISCONNECT_REQUEST,
			siteId
		} );

		return wp.undocumented().disconnectJetpack( siteId )
			.then( ( response ) => {
				dispatch( {
					type: JETPACK_DISCONNECT_RECEIVE,
					siteId,
					status: response
				} );
				dispatch( {
					type: JETPACK_DISCONNECT_REQUEST_SUCCESS,
					siteId
				} );
			} ).catch( error => {
				dispatch( {
					type: JETPACK_DISCONNECT_REQUEST_FAILURE,
					siteId,
					error: error.message
				} );
			} );
	};
};
