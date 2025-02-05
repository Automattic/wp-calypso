/**
 * External dependencies
 */
import { combineReducers } from '@wordpress/data';
import { Route } from '../../../router/src';

type Action = {
	type: string;
	route: Route;
	name: string;
};

function routes( state: Route[] = [], action: Action ) {
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
