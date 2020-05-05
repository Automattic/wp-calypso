/**
 * Internal dependencies
 */
import {
	JETPACK_SCAN_HISTORY_UPDATE,
	JETPACK_SCAN_HISTORY_REQUEST,
	JETPACK_SCAN_HISTORY_REQUEST_SUCCESS,
	JETPACK_SCAN_HISTORY_REQUEST_FAILURE,
} from 'state/action-types';
import { combineReducers, keyedReducer } from 'state/utils';

export const requestStatus = keyedReducer( 'siteId', ( state, { type } ) => {
	switch ( type ) {
		case JETPACK_SCAN_HISTORY_REQUEST:
			return 'pending';

		case JETPACK_SCAN_HISTORY_REQUEST_SUCCESS:
			return 'success';

		case JETPACK_SCAN_HISTORY_REQUEST_FAILURE:
			return 'failed';
	}

	return state;
} );

export const data = keyedReducer( 'siteId', ( state, { type, payload } ) => {
	switch ( type ) {
		case JETPACK_SCAN_HISTORY_UPDATE:
			return payload;
	}

	return state;
} );

export default combineReducers( {
	requestStatus,
	data,
} );
