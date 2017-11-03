/** @format */

/**
 * External dependencies
 */
import { stubTrue, stubFalse } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer, combineReducers } from 'state/utils';
import {
	CONCIERGE_SHIFTS_FETCH,
	CONCIERGE_SHIFTS_FETCH_FAILED,
	CONCIERGE_SHIFTS_FETCH_SUCCESS,
} from 'state/action-types';

export const items = createReducer( null, {
	[ CONCIERGE_SHIFTS_FETCH ]: () => null,
	[ CONCIERGE_SHIFTS_FETCH_FAILED ]: state => state,
	[ CONCIERGE_SHIFTS_FETCH_SUCCESS ]: ( state, { shifts } ) => shifts,
} );

export const isRequesting = createReducer( false, {
	[ CONCIERGE_SHIFTS_FETCH ]: stubTrue,
	[ CONCIERGE_SHIFTS_FETCH_FAILED ]: stubFalse,
	[ CONCIERGE_SHIFTS_FETCH_SUCCESS ]: stubFalse,
} );

export const error = createReducer( null, {
	[ CONCIERGE_SHIFTS_FETCH ]: () => null,
	[ CONCIERGE_SHIFTS_FETCH_FAILED ]: ( state, action ) => action.error,
	[ CONCIERGE_SHIFTS_FETCH_SUCCESS ]: () => null,
} );

export default combineReducers( {
	items,
	isRequesting,
	error,
} );
