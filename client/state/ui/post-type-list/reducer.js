/**
 * External dependencies
 */

import { without } from 'lodash';

/**
 * Internal dependencies
 */
import {
	POST_TYPE_LIST_LIKES_POPOVER_HIDE,
	POST_TYPE_LIST_LIKES_POPOVER_TOGGLE,
	POST_TYPE_LIST_MULTI_SELECTION_MODE_TOGGLE,
	POST_TYPE_LIST_SELECTION_TOGGLE,
	POST_TYPE_LIST_SHARE_PANEL_HIDE,
	POST_TYPE_LIST_SHARE_PANEL_TOGGLE,
	ROUTE_SET,
} from 'state/action-types';

const initialState = {
	postIdWithActiveSharePanel: null,
	postIdWithActiveLikesPopover: null,
	isMultiSelectEnabled: false,
	selectedPosts: [],
};

export const postTypeList = ( state = initialState, action ) => {
	switch ( action.type ) {
		case POST_TYPE_LIST_MULTI_SELECTION_MODE_TOGGLE:
			return {
				...state,
				isMultiSelectEnabled: ! state.isMultiSelectEnabled,
				selectedPosts: state.isMultiSelectEnabled ? state.selectedPosts : [],
			};

		case POST_TYPE_LIST_SELECTION_TOGGLE:
			if ( state.selectedPosts.indexOf( action.postGlobalId ) > -1 ) {
				return {
					...state,
					selectedPosts: without( state.selectedPosts, action.postGlobalId ),
				};
			}
			return {
				...state,
				selectedPosts: [ ...state.selectedPosts, action.postGlobalId ],
			};

		case ROUTE_SET:
			return {
				...state,
				isMultiSelectEnabled: false,
				postIdWithActiveLikesPopover: null,
				selectedPosts: [],
			};

		case POST_TYPE_LIST_LIKES_POPOVER_HIDE:
			return {
				...state,
				postIdWithActiveLikesPopover: null,
			};

		case POST_TYPE_LIST_LIKES_POPOVER_TOGGLE:
			if ( state.postIdWithActiveLikesPopover === action.postGlobalId ) {
				return {
					...state,
					postIdWithActiveLikesPopover: null,
				};
			}
			return {
				...state,
				postIdWithActiveLikesPopover: action.postGlobalId,
			};

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
