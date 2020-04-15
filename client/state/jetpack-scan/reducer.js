/**
 * Internal dependencies
 */
import {
	JETPACK_SCAN_UPDATE,
	JETPACK_SCAN_REQUEST,
	JETPACK_SCAN_REQUEST_SUCCESS,
	JETPACK_SCAN_REQUEST_FAILURE,
} from 'state/action-types';
import { combineReducers, keyedReducer } from 'state/utils';
import historyReducer from './history/reducer';

export const requestStatus = keyedReducer( 'siteId', ( state, { type } ) => {
	switch ( type ) {
		case JETPACK_SCAN_REQUEST:
			return 'pending';

		case JETPACK_SCAN_REQUEST_SUCCESS:
			return 'success';

		case JETPACK_SCAN_REQUEST_FAILURE:
			return 'failed';
	}

	return state;
} );

export const scan = keyedReducer( 'siteId', ( state, { type, payload } ) => {
	switch ( type ) {
		case JETPACK_SCAN_UPDATE:
			return payload;
	}

	return state;
} );

export default combineReducers( {
	requestStatus,
	scan,
	history: historyReducer,
} );
