/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import { CONCIERGE_SELECT_TIME_SLOT, CONCIERGE_UPDATE_BOOKING_STATUS } from 'state/action-types';

export const timestamp = createReducer( null, {
	[ CONCIERGE_SELECT_TIME_SLOT ]: ( state, action ) => action.timestamp,
} );

export const status = createReducer( null, {
	[ CONCIERGE_UPDATE_BOOKING_STATUS ]: ( state, action ) => action.status,
} );

const selectedTimeSlots = keyedReducer( 'day', timestamp );

export default combineReducers( {
	selectedTimeSlots,
	status,
} );
