/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { CONCIERGE_SHIFTS_FETCH, CONCIERGE_SHIFTS_UPDATE } from 'state/action-types';

export const shifts = createReducer( null, {
	[ CONCIERGE_SHIFTS_FETCH ]: () => null,
	[ CONCIERGE_SHIFTS_UPDATE ]: ( state, { shifts } ) => shifts,
} );

export default shifts;
