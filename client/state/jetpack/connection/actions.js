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
	JETPACK_USER_CONNECTION_CHANGE_OWNER,
	JETPACK_USER_CONNECTION_DATA_RECEIVE,
	JETPACK_USER_CONNECTION_DATA_REQUEST,
	JETPACK_USER_CONNECTION_DATA_REQUEST_SUCCESS,
	JETPACK_USER_CONNECTION_DATA_REQUEST_FAILURE,
} from 'state/action-types';
import wp from 'lib/wp';

import 'state/data-layer/wpcom/jetpack/connection/owner';

export const requestJetpackConnectionStatus = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_CONNECTION_STATUS_REQUEST,
			siteId,
		} );

		return wp
			.undocumented()
			.getJetpackConnectionStatus( siteId )
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

		return wp
			.undocumented()
			.getJetpackUserConnectionData( siteId )
			.then( ( response ) => {
				dispatch( {
					type: JETPACK_USER_CONNECTION_DATA_RECEIVE,
					siteId,
					data: response.data.currentUser,
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
			type: JETPACK_DISCONNECT_REQUEST,
			siteId,
		} );

		return wp
			.undocumented()
			.disconnectJetpack( siteId )
			.then( ( response ) => {
				dispatch( {
					type: JETPACK_DISCONNECT_RECEIVE,
					siteId,
					status: response,
				} );
				dispatch( {
					type: JETPACK_DISCONNECT_REQUEST_SUCCESS,
					siteId,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: JETPACK_DISCONNECT_REQUEST_FAILURE,
					siteId,
					error: error.message,
				} );
			} );
	};
};

/**
 * Change the jetpack master user.
 *
 * @param {number} siteId the site ID
 * @param {number} newOwnerWporgId the wporg user ID of the new owner
 * @param {string} newOwnerWpcomDisplayName display name for UI messages
 * @returns {object} action object
 */
export const changeOwner = ( siteId, newOwnerWporgId, newOwnerWpcomDisplayName ) => {
	return {
		type: JETPACK_USER_CONNECTION_CHANGE_OWNER,
		siteId,
		newOwnerWporgId,
		newOwnerWpcomDisplayName,
	};
};
