import { withStorageKey } from '@automattic/state-utils';
import { ADMIN_MENU_RECEIVE, ADMIN_MENU_REQUEST } from 'calypso/state/action-types';
import {
	keyedReducer,
	combineReducers,
	withSchemaValidation,
	withPersistence,
} from 'calypso/state/utils';
import 'calypso/state/data-layer/wpcom/sites/admin-menu';
import { groupsSchema, menusSchema } from './schema';

const menusReducer = ( state = [], action ) => {
	switch ( action.type ) {
		case ADMIN_MENU_RECEIVE:
			return action.menu;
		default:
			return state;
	}
};

const groupsBySiteReducer = ( state = [], action ) => {
	switch ( action.type ) {
		case ADMIN_MENU_RECEIVE:
			return action.groups || [];
		default:
			return state;
	}
};

export const menus = withSchemaValidation(
	menusSchema,
	keyedReducer( 'siteId', withPersistence( menusReducer ) )
);

export const groupsBySite = withSchemaValidation(
	groupsSchema,
	keyedReducer( 'siteId', withPersistence( groupsBySiteReducer ) )
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
	groupsBySite,
	requesting,
} );

export default withStorageKey( 'adminMenu', reducer );
