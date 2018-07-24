/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { CONCIERGE_INITIAL_REQUEST, CONCIERGE_INITIAL_UPDATE } from 'state/action-types';

export const nextAppointment = createReducer( null, {
	[ CONCIERGE_INITIAL_REQUEST ]: () => null,
	[ CONCIERGE_INITIAL_UPDATE ]: ( state, action ) => action.initial.nextAppointment,
} );

export default nextAppointment;
