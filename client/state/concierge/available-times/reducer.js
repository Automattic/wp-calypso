/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	CONCIERGE_AVAILABLE_TIMES_REQUEST,
	CONCIERGE_AVAILABLE_TIMES_UPDATE,
	CONCIERGE_INITIAL_UPDATE,
} from 'state/action-types';

export const availableTimes = createReducer( null, {
	[ CONCIERGE_AVAILABLE_TIMES_REQUEST ]: () => null,
	[ CONCIERGE_AVAILABLE_TIMES_UPDATE ]: ( state, action ) => action.availableTimes,
	[ CONCIERGE_INITIAL_UPDATE ]: ( state, action ) => action.initial.availableTimes,
} );

export default availableTimes;
