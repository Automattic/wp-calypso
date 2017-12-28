/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'client/state/utils';
import {
	CONCIERGE_AVAILABLE_TIMES_REQUEST,
	CONCIERGE_AVAILABLE_TIMES_UPDATE,
} from 'client/state/action-types';

export const availableTimes = createReducer( null, {
	[ CONCIERGE_AVAILABLE_TIMES_REQUEST ]: () => null,
	[ CONCIERGE_AVAILABLE_TIMES_UPDATE ]: ( state, action ) => action.availableTimes,
} );

export default availableTimes;
