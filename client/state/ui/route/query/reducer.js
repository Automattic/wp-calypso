/** @format */

/**
 * External dependencies
 */

import { isEqual, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'client/state/utils';
import { ROUTE_SET } from 'client/state/action-types';

const timestamped = query => ( {
	...query,
	_timestamp: Date.now(),
} );

const isEqualQuery = ( a, b ) => isEqual( omit( a, '_timestamp' ), omit( b, '_timestamp' ) );

const initial = createReducer(
	false,
	{
		[ ROUTE_SET ]: ( state, { query } ) => ( state === false ? timestamped( query ) : state ),
	},
	{ type: [ 'boolean', 'object' ] }
);

const current = createReducer(
	{},
	{
		[ ROUTE_SET ]: ( state, { query } ) =>
			! isEqualQuery( state, query ) ? timestamped( query ) : state,
	},
	{ type: 'object' }
);

export default combineReducers( {
	initial,
	current,
} );
