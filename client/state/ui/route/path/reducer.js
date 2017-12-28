/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { createReducer, combineReducers } from 'client/state/utils';
import { ROUTE_SET } from 'client/state/action-types';

const initial = createReducer(
	'',
	{
		[ ROUTE_SET ]: ( state, { path } ) => ( state === '' ? path : state ),
	},
	{ type: 'string' }
);

const current = createReducer(
	'',
	{
		[ ROUTE_SET ]: ( state, { path } ) => path,
	},
	{ type: 'string' }
);

export default combineReducers( {
	initial,
	current,
} );
