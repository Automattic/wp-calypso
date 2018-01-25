/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { SIDEBAR_ROUTE_SET } from 'state/action-types';
import { createReducer, combineReducers } from 'state/utils';

export const route = createReducer( '', {
	[ SIDEBAR_ROUTE_SET ]: ( state, action ) => get( action, 'route', state ),
} );

export const parentRoute = createReducer( '', {
	[ SIDEBAR_ROUTE_SET ]: ( state, action ) => get( action, 'parentRoute', state ),
} );

export default combineReducers( {
	route,
	parentRoute,
} );
