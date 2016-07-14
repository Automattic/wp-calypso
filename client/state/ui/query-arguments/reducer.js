/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	ROUTE_SET,
} from 'state/action-types';

const initial = createReducer( false, {
	[ ROUTE_SET ]: ( state, { query } ) =>
		state === false ? query : state,
} );

const current = createReducer( {}, {
	[ ROUTE_SET ]: ( state, { query } ) => query,
} );

export default combineReducers( {
	initial,
	current,
} );
