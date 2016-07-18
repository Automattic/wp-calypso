/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { isEqual, omit } from 'lodash';

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

const isEqualQuery = ( a, b ) =>
	isEqual(
		omit( a, 'timestamp' ),
		omit( b, 'timestamp' ) );

const initial = createReducer( false, {
	[ ROUTE_SET ]: ( state, { query } ) =>
		state === false ? timestamped( query ) : state,
} );

const current = createReducer( {}, {
	[ ROUTE_SET ]: ( state, { query } ) =>
		! isEqualQuery( state, query )
			? timestamped( query )
			: state,
} );

export default combineReducers( {
	initial,
	current,
} );
