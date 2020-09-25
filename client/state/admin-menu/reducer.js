/**
 * Internal dependencies
 */
import { withStorageKey, keyedReducer, combineReducers } from 'state/utils';
import 'state/data-layer/wpcom/sites/admin-menu';
import { ADMIN_MENU_RECEIVE, ADMIN_MENU_REQUEST } from 'state/action-types';

export const menus = keyedReducer( 'siteId', ( state = [], action ) => {
	switch ( action.type ) {
		case ADMIN_MENU_RECEIVE:
			return action.menu;
		default:
			return state;
	}
} );

export function requesting( state = false, action ) {
	switch ( action.type ) {
		case ADMIN_MENU_REQUEST:
		case ADMIN_MENU_RECEIVE:
			return action.type === ADMIN_MENU_REQUEST;
	}

	return state;
}

const reducer = combineReducers( {
	menus,
	requesting,
} );

export default withStorageKey( 'adminMenu', reducer );
