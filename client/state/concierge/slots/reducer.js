/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { CONCIERGE_SLOTS_REQUEST, CONCIERGE_SLOTS_UPDATE } from 'state/action-types';

export const slots = createReducer( null, {
	[ CONCIERGE_SLOTS_REQUEST ]: () => null,
	[ CONCIERGE_SLOTS_UPDATE ]: ( state, action ) => action.slots,
} );

export default slots;
