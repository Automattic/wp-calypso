/**
 * Internal dependencies
 */
import { withStorageKey, keyedReducer, combineReducers } from 'state/utils';
import 'state/data-layer/wpcom/sites/admin-menu';
import {
	ADMIN_MENU_RECEIVE,
	ADMIN_MENU_REQUEST,
	ADMIN_MENU_REQUEST_SUCCESS,
	ADMIN_MENU_REQUEST_FAILURE,
} from 'state/action-types';

export const menus = ( state = [], action ) => {
	switch ( action.type ) {
		case ADMIN_MENU_RECEIVE:
			return [ ...state, ...action.menu ];
		default:
			return state;
	}
};

export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case ADMIN_MENU_REQUEST:
			return {
				...state,
				isRequesting: true,
			};
		case ADMIN_MENU_RECEIVE:
			return {
				...state,
				isRequesting: false,
			};
	}

	return state;
}

const reducer = combineReducers( {
	requesting,
	menus: keyedReducer( 'siteId', menus ),
} );

export default withStorageKey( 'adminMenu', reducer );
