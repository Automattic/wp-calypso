import {
	BREADCRUMB_RESET_LIST,
	BREADCRUMB_UPDATE_LIST,
	BREADCRUMB_APPEND_ITEM,
} from 'calypso/state/action-types';

// Stores the complete list of breadcrumbs in an array,
export default ( state = [], action ) => {
	switch ( action.type ) {
		case BREADCRUMB_RESET_LIST:
			return [];
		case BREADCRUMB_UPDATE_LIST:
			return [ ...action.items ];
		case BREADCRUMB_APPEND_ITEM: {
			// If the new item already exists, clear crumbs back to & including the existing item, & add the new item.
			const existingItemIndex = state.findIndex( ( item ) => item.id === action.item?.id );
			if ( existingItemIndex > -1 ) {
				state = state.slice( 0, existingItemIndex );
			}
			return [ ...state, action.item ];
		}
	}

	return state;
};
