/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { ROUTE_SET } from 'state/action-types';

export const path = createReducer( '', {
	[ ROUTE_SET ]: ( state, { path = '' } ) =>
		path
} );

export const params = createReducer( {}, {
	[ ROUTE_SET ]: ( state, { params = {} } ) =>
		params
} );

export default combineReducers( {
	path,
	params
} );
