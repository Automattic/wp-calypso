/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import {
	JETPACK_SCAN_THREAT_REQUEST,
	JETPACK_SCAN_THREAT_REQUEST_SUCCESS,
	JETPACK_SCAN_THREAT_REQUEST_FAILURE,
} from 'state/action-types';

export const requestStatus = keyedReducer( 'siteId', ( state = {}, { type, threatId } ) => {
	let status;
	switch ( type ) {
		case JETPACK_SCAN_THREAT_REQUEST:
			status = 'pending';
			break;

		case JETPACK_SCAN_THREAT_REQUEST_SUCCESS:
			status = 'success';
			break;

		case JETPACK_SCAN_THREAT_REQUEST_FAILURE:
			status = 'failed';
			break;
	}

	return {
		...state,
		[ threatId ]: status,
	};
} );

export default combineReducers( {
	requestStatus,
} );
