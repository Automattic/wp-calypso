/**
 * Internal dependencies
 */
import {
	JETPACK_SCAN_THREAT_COUNTS_REQUEST,
	JETPACK_SCAN_THREAT_COUNTS_REQUEST_SUCCESS,
	JETPACK_SCAN_THREAT_COUNTS_REQUEST_FAILURE,
	JETPACK_SCAN_THREAT_COUNTS_UPDATE,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';

const requestStatus = keyedReducer( 'siteId', ( state = [], { type } ) => {
	switch ( type ) {
		case JETPACK_SCAN_THREAT_COUNTS_REQUEST:
			return 'pending';
		case JETPACK_SCAN_THREAT_COUNTS_REQUEST_SUCCESS:
			return 'success';
		case JETPACK_SCAN_THREAT_COUNTS_REQUEST_FAILURE:
			return 'failure';
	}

	return state;
} );

const data = keyedReducer( 'siteId', ( state = [], { type, counts } ) => {
	if ( type === JETPACK_SCAN_THREAT_COUNTS_UPDATE ) {
		return counts;
	}

	return state;
} );

export default combineReducers( { requestStatus, data } );
