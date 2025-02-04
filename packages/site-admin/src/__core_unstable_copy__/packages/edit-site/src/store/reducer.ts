/**
 * External dependencies
 */
import { combineReducers } from '@wordpress/data';

function routes( state = [], action ) {
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
