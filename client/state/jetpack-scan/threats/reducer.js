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
		// Every time we get a response from `/scan` we want to include here
		// threats that are being updated.
		case JETPACK_SCAN_UPDATE: {
			// @todo: format the `fixer_status` property at the data-layer level
			return payload.threats
				? payload.threats.filter( ( threat ) => threat.fixer_status === 'in_progress' )
				: [];
		}
		case JETPACK_SCAN_UPDATE_THREAT:
			return [ ...state, payload.threatId ];
		case JETPACK_SCAN_UPDATE_THREAT_COMPLETED:
			return state.filter( ( threatId ) => threatId !== payload.threatId );
	}

	return state;
} );

export default combineReducers( { updating } );
