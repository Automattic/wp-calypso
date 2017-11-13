/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { CONCIERGE_SHIFTS_REQUEST, CONCIERGE_SHIFTS_UPDATE } from 'state/action-types';

export const shifts = createReducer( null, {
	[ CONCIERGE_SHIFTS_REQUEST ]: () => null,
	[ CONCIERGE_SHIFTS_UPDATE ]: ( state, action ) => action.shifts,
} );

export default shifts;
