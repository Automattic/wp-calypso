/**
 * Internal dependencies
 */
import {
	JETPACK_SCAN_UPDATE,
	JETPACK_SCAN_UPDATE_THREAT,
	JETPACK_SCAN_UPDATE_THREAT_COMPLETED,
} from 'state/action-types';
import { combineReducers, keyedReducer } from 'state/utils';

const updating = keyedReducer( 'siteId', ( state = [], { type, ...payload } ) => {
	switch ( type ) {
		// We want to clean up this state every time the `/scan` endpoint
		// returns a new array of threats because that is the main source of
		// truth of the current state of the threats.
		case JETPACK_SCAN_UPDATE:
			return [];
		case JETPACK_SCAN_UPDATE_THREAT:
			return [ ...state, payload.threatId ];
		case JETPACK_SCAN_UPDATE_THREAT_COMPLETED:
			return state.filter( ( threatId ) => threatId !== payload.threatId );
	}

	return state;
} );

export default combineReducers( { updating } );
