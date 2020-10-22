/**
 * Internal dependencies
 */
import {
	JETPACK_SCAN_ENQUEUE_UPDATE,
	JETPACK_SCAN_ENQUEUE_REQUEST,
	JETPACK_SCAN_ENQUEUE_REQUEST_SUCCESS,
	JETPACK_SCAN_ENQUEUE_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';

export const requestStatus = keyedReducer( 'siteId', ( state, { type } ) => {
	switch ( type ) {
		case JETPACK_SCAN_ENQUEUE_REQUEST:
			return 'pending';

		case JETPACK_SCAN_ENQUEUE_REQUEST_SUCCESS:
			return 'success';

		case JETPACK_SCAN_ENQUEUE_REQUEST_FAILURE:
			return 'failed';
	}

	return state;
} );

export const data = keyedReducer( 'siteId', ( state, { type, payload } ) => {
	switch ( type ) {
		case JETPACK_SCAN_ENQUEUE_UPDATE:
			return payload;
	}

	return state;
} );

export default combineReducers( {
	requestStatus,
	data,
} );
