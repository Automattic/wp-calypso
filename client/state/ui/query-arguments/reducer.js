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

const timestamped = ( query ) => ( {
	...query,
	timestamp: Date.now(),
} );

const initial = createReducer( false, {
	[ ROUTE_SET ]: ( state, { query } ) =>
		state === false ? timestamped( query ) : state,
} );

const current = createReducer( {}, {
	[ ROUTE_SET ]: ( state, { query } ) => timestamped( query ),
} );

export default combineReducers( {
	initial,
	current,
} );
