import { withStorageKey } from '@automattic/state-utils';
import {
	BREADCRUMB_RESET_LIST,
	BREADCRUMB_UPDATE_LIST,
	BREADCRUMB_APPEND_ITEM,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { breadcrumbSchema } from './schema';

// Stores the complete list of breadcrumbs in an array,
export const items = withSchemaValidation( breadcrumbSchema, ( state = [], action ) => {
	switch ( action.type ) {
		case BREADCRUMB_RESET_LIST:
			return [];
		case BREADCRUMB_UPDATE_LIST:
			return action.items;
		case BREADCRUMB_APPEND_ITEM:
			return [ ...state, action.item ];
	}

	return state;
} );

const combinedReducer = combineReducers( {
	items,
} );

export default withStorageKey( 'breadcrumb', combinedReducer );
