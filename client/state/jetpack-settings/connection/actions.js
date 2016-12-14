/**
 * Internal dependencies
 */
import {
	JETPACK_CONNECTION_STATUS_RECEIVE,
	JETPACK_CONNECTION_STATUS_REQUEST,
	JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS,
	JETPACK_CONNECTION_STATUS_REQUEST_FAILURE
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
