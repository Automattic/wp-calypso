/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	SIDEBAR_ROUTE_SET,
	SIDEBAR_ROUTE_TRANSITION_SET,
	SIDEBAR_ROUTE_TRANSITION_DONE,
} from 'state/action-types';
import { createReducer, combineReducers } from 'state/utils';

export const route = createReducer( 'settings', {
	[ SIDEBAR_ROUTE_SET ]: ( state, action ) => get( action, 'route', state ),
} );

export const parentRoute = createReducer( '', {
	[ SIDEBAR_ROUTE_SET ]: ( state, action ) => get( action, 'parentRoute', state ),
} );

export const transition = createReducer(
	{},
	{
		[ SIDEBAR_ROUTE_TRANSITION_SET ]: ( state, { route, direction } ) => ( {
			route,
			direction,
		} ),

		[ SIDEBAR_ROUTE_TRANSITION_DONE ]: () => ( {
			route: null,
			direction: null,
		} ),
	}
);

export default combineReducers( {
	route,
	parentRoute,
	transition,
} );
