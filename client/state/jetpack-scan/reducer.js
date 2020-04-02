/**
 * Internal dependencies
 */
import {
	JETPACK_SCAN_UPDATE,
	JETPACK_SCAN_UPDATE_SUCCESS,
	JETPACK_SCAN_UPDATE_FAILURE,
} from 'state/action-types';
import { combineReducers, keyedReducer } from 'state/utils';

export const requestStatus = keyedReducer( 'siteId', ( state, { type } ) => {
	switch ( type ) {
		case JETPACK_SCAN_UPDATE:
			return 'pending';

		case JETPACK_SCAN_UPDATE_SUCCESS:
			return 'success';

		case JETPACK_SCAN_UPDATE_FAILURE:
			return 'failed';
	}

	return state;
} );

export default combineReducers( {
	requestStatus,
} );
