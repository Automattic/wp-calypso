import {
	BREADCRUMB_RESET_LIST,
	BREADCRUMB_UPDATE_LIST,
	BREADCRUMB_APPEND_ITEM,
} from 'calypso/state/action-types';
import { keyedReducer } from 'calypso/state/utils';

// Stores the complete list of breadcrumbs in an array,
const breadcrumbs = ( state = [], action ) => {
	switch ( action.type ) {
		case BREADCRUMB_RESET_LIST:
			return [];
		case BREADCRUMB_UPDATE_LIST:
			return [ ...action.items ];
		case BREADCRUMB_APPEND_ITEM:
			// If it is the same kind as the last item, replace it.
			// eslint-disable-next-line no-case-declarations
			const currentLastItem = state[ state.length - 1 ] || {};
			if ( currentLastItem.id === action.item?.id ) {
				state.pop();
			}

			return [ ...state, action.item ];
	}

	return state;
};

export default keyedReducer( 'siteId', breadcrumbs );
