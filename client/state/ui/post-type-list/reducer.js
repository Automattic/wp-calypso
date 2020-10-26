/**
 * Internal dependencies
 */
import {
	POST_TYPE_LIST_SHARE_PANEL_HIDE,
	POST_TYPE_LIST_SHARE_PANEL_TOGGLE,
} from 'calypso/state/action-types';

const initialState = {
	postIdWithActiveSharePanel: null,
};

export const postTypeList = ( state = initialState, action ) => {
	switch ( action.type ) {
		case POST_TYPE_LIST_SHARE_PANEL_HIDE:
			return {
				...state,
				postIdWithActiveSharePanel: null,
			};

		case POST_TYPE_LIST_SHARE_PANEL_TOGGLE:
			if ( state.postIdWithActiveSharePanel === action.postGlobalId ) {
				return {
					...state,
					postIdWithActiveSharePanel: null,
				};
			}
			return {
				...state,
				postIdWithActiveSharePanel: action.postGlobalId,
			};
	}

	return state;
};

export default postTypeList;
