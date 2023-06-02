import wp from 'calypso/lib/wp';
import {
	JETPACK_CONNECTION_STATUS_RECEIVE,
	JETPACK_CONNECTION_STATUS_REQUEST,
	JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS,
	JETPACK_CONNECTION_STATUS_REQUEST_FAILURE,
	JETPACK_DISCONNECT_RECEIVE,
	JETPACK_SITE_DISCONNECT_REQUEST,
	JETPACK_USER_CONNECTION_CHANGE_OWNER,
	JETPACK_USER_CONNECTION_DATA_RECEIVE,
	JETPACK_USER_CONNECTION_DATA_REQUEST,
	JETPACK_USER_CONNECTION_DATA_REQUEST_SUCCESS,
	JETPACK_USER_CONNECTION_DATA_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';

import 'calypso/state/data-layer/wpcom/jetpack/connection/owner';
import 'calypso/state/jetpack/init';

export const requestJetpackConnectionStatus = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_CONNECTION_STATUS_REQUEST,
			siteId,
		} );

		return wp.req
			.get( `/jetpack-blogs/${ siteId }/rest-api/`, { path: '/jetpack/v4/connection/' } )
			.then( ( response ) => {
				dispatch( {
					type: JETPACK_CONNECTION_STATUS_RECEIVE,
					siteId,
					status: response.data,
				} );
				dispatch( {
					type: JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS,
					siteId,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: JETPACK_CONNECTION_STATUS_REQUEST_FAILURE,
					siteId,
					error: error.message,
				} );
			} );
	};
};

export const requestJetpackUserConnectionData = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_USER_CONNECTION_DATA_REQUEST,
			siteId,
		} );

		return wp.req
			.get( `/jetpack-blogs/${ siteId }/rest-api/`, { path: '/jetpack/v4/connection/data/' } )
			.then( ( response ) => {
				dispatch( {
					type: JETPACK_USER_CONNECTION_DATA_RECEIVE,
					siteId,
					data: response.data,
				} );
				dispatch( {
					type: JETPACK_USER_CONNECTION_DATA_REQUEST_SUCCESS,
					siteId,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: JETPACK_USER_CONNECTION_DATA_REQUEST_FAILURE,
					siteId,
					error: error.message,
				} );
			} );
	};
};

export const disconnect = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_SITE_DISCONNECT_REQUEST,
		} );
		return wp.req.post( `/jetpack-blogs/${ siteId }/mine/delete` ).then( ( response ) => {
			dispatch( {
				type: JETPACK_DISCONNECT_RECEIVE,
				siteId,
				status: response,
			} );
			dispatch( fetchCurrentUser() );
		} );
	};
};

/**
 * Change the jetpack connection owner.
 *
 * @param {number} siteId the site ID
 * @param {number} newOwnerWporgId the wporg user ID of the new owner
 * @param {string} newOwnerWpcomDisplayName display name for UI messages
 * @returns {Object} action object
 */
export const changeOwner = ( siteId, newOwnerWporgId, newOwnerWpcomDisplayName ) => {
	return {
		type: JETPACK_USER_CONNECTION_CHANGE_OWNER,
		siteId,
		newOwnerWporgId,
		newOwnerWpcomDisplayName,
	};
};
