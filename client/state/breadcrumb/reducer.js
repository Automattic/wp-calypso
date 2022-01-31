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
		case BREADCRUMB_APPEND_ITEM:
			// Don't append if it is the same as the last item
			// eslint-disable-next-line no-case-declarations
			const currentLastItem = state.at( -1 ) || {};
			if ( currentLastItem.label === action.item?.label ) {
				return [ ...state ];
			}

			return [ ...state, action.item ];
	}

	return state;
};
