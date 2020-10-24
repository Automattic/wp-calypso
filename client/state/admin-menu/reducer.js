/**
 * Internal dependencies
 */
import {
	withStorageKey,
	keyedReducer,
	combineReducers,
	withSchemaValidation,
} from 'calypso/state/utils';
import 'calypso/state/data-layer/wpcom/sites/admin-menu';
import { ADMIN_MENU_RECEIVE, ADMIN_MENU_REQUEST } from 'calypso/state/action-types';
import { menusSchema } from './schema';

export const menus = withSchemaValidation(
	menusSchema,
	keyedReducer( 'siteId', ( state = [], action ) => {
		switch ( action.type ) {
			case ADMIN_MENU_RECEIVE:
				return action.menu;
			default:
				return state;
		}
	} )
);

export const requesting = ( state = false, action ) => {
	switch ( action.type ) {
		case ADMIN_MENU_REQUEST:
		case ADMIN_MENU_RECEIVE:
			return action.type === ADMIN_MENU_REQUEST;
	}

	return state;
};

const reducer = combineReducers( {
	menus,
	requesting,
} );

export default withStorageKey( 'adminMenu', reducer );
