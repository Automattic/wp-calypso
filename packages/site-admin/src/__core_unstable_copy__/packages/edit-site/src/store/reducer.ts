/**
 * External dependencies
 */
import { combineReducers } from '@wordpress/data';
import { RouteProps } from '../types';

function routes(
	state: RouteProps[] = [],
	action: { type: string; route: RouteProps; name: string }
) {
	switch ( action.type ) {
		case 'REGISTER_ROUTE':
			return [ ...state, action.route ];
		case 'UNREGISTER_ROUTE':
			return state.filter( ( route ) => route.name !== action.name );
	}

	return state;
}

export default combineReducers( {
	routes,
} );
