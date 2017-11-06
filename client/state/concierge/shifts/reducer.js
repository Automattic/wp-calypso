/** @format */

/**
 * External dependencies
 */
import { stubTrue, stubFalse } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer, combineReducers } from 'state/utils';
import { CONCIERGE_SHIFTS_FETCH, CONCIERGE_SHIFTS_UPDATE } from 'state/action-types';

export const items = createReducer( null, {
	[ CONCIERGE_SHIFTS_FETCH ]: () => null,
	[ CONCIERGE_SHIFTS_UPDATE ]: ( state, { shifts } ) => shifts,
} );

export const isFetching = createReducer( false, {
	[ CONCIERGE_SHIFTS_FETCH ]: stubTrue,
	[ CONCIERGE_SHIFTS_UPDATE ]: stubFalse,
} );

export default combineReducers( {
	items,
	isFetching,
} );
