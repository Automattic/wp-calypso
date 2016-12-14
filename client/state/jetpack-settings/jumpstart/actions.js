/**
 * Internal dependencies
 */
import {
	JETPACK_JUMPSTART_ACTIVATE,
	JETPACK_JUMPSTART_ACTIVATE_SUCCESS,
	JETPACK_JUMPSTART_ACTIVATE_FAILURE,
	JETPACK_JUMPSTART_DEACTIVATE,
	JETPACK_JUMPSTART_DEACTIVATE_SUCCESS,
	JETPACK_JUMPSTART_DEACTIVATE_FAILURE,
	JETPACK_JUMPSTART_STATUS_RECEIVE,
	JETPACK_JUMPSTART_STATUS_REQUEST,
	JETPACK_JUMPSTART_STATUS_REQUEST_SUCCESS,
	JETPACK_JUMPSTART_STATUS_REQUEST_FAILURE
} from 'state/action-types';
import wp from 'lib/wp';

export const activateJumpstart = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_JUMPSTART_ACTIVATE,
			siteId
		} );

		return wp.undocumented().updateJetpackJumpstart( siteId, true )
			.then( () => {
				dispatch( {
					type: JETPACK_JUMPSTART_ACTIVATE_SUCCESS,
					siteId
				} );
			} ).catch( error => {
				dispatch( {
					type: JETPACK_JUMPSTART_ACTIVATE_FAILURE,
					siteId,
					error: error.message
				} );
			} );
	};
};

export const deactivateJumpstart = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_JUMPSTART_DEACTIVATE,
			siteId
		} );

		return wp.undocumented().updateJetpackJumpstart( siteId, false )
			.then( () => {
				dispatch( {
					type: JETPACK_JUMPSTART_DEACTIVATE_SUCCESS,
					siteId
				} );
			} ).catch( error => {
				dispatch( {
					type: JETPACK_JUMPSTART_DEACTIVATE_FAILURE,
					siteId,
					error: error.message
				} );
			} );
	};
};

export const requestJumpstartStatus = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_JUMPSTART_STATUS_REQUEST,
			siteId
		} );

		return wp.undocumented().getJetpackJumpstart( siteId )
			.then( ( { status } ) => {
				dispatch( {
					type: JETPACK_JUMPSTART_STATUS_RECEIVE,
					siteId,
					status
				} );
				dispatch( {
					type: JETPACK_JUMPSTART_STATUS_REQUEST_SUCCESS,
					siteId
				} );
			} ).catch( error => {
				dispatch( {
					type: JETPACK_JUMPSTART_STATUS_REQUEST_FAILURE,
					siteId,
					error: error.message
				} );
			} );
	};
};
