import { withStorageKey } from '@automattic/state-utils';
import { WOO_ADMIN_MENU_RECEIVE, WOO_ADMIN_MENU_REQUEST } from 'calypso/state/action-types';
import {
	keyedReducer,
	combineReducers,
	withSchemaValidation,
	withPersistence,
} from 'calypso/state/utils';
import 'calypso/state/data-layer/wpcom/sites/woo-admin-menu';
import { menusSchema } from './schema';

const menusReducer = ( state = [], action ) => {
	switch ( action.type ) {
		case WOO_ADMIN_MENU_RECEIVE:
			return action.menuData;
		default:
			return state;
	}
};

export const menus = withSchemaValidation(
	menusSchema,
	keyedReducer( 'siteId', withPersistence( menusReducer ) )
);

export const requesting = ( state = false, action ) => {
	switch ( action.type ) {
		case WOO_ADMIN_MENU_REQUEST:
		case WOO_ADMIN_MENU_RECEIVE:
			return action.type === WOO_ADMIN_MENU_REQUEST;
	}

	return state;
};

const reducer = combineReducers( {
	menus,
	requesting,
} );

export default withStorageKey( 'wooAdminMenu', reducer );
