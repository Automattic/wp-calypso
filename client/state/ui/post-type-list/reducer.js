/**
 * External dependencies
 *
 * @format
 */

import { without } from 'lodash';

/**
 * Internal dependencies
 */
import {
	POST_TYPE_LIST_MULTI_SELECTION_TOGGLE,
	POST_TYPE_LIST_SELECTION_RESET,
	POST_TYPE_LIST_SELECTION_TOGGLE,
	POST_TYPE_LIST_SHARE_PANEL_HIDE,
	POST_TYPE_LIST_SHARE_PANEL_TOGGLE,
} from 'state/action-types';

const initialState = {
	activeSharePanels: [],
	isMultiSelectEnabled: false,
	selectedPosts: [],
};

export const postTypeList = ( state = initialState, action ) => {
	switch ( action.type ) {
		case POST_TYPE_LIST_MULTI_SELECTION_TOGGLE:
			return {
				...state,
				isMultiSelectEnabled: ! state.isMultiSelectEnabled,
			};
		case POST_TYPE_LIST_SELECTION_RESET:
			return {
				...state,
				selectedPosts: [],
			};
		case POST_TYPE_LIST_SELECTION_TOGGLE:
			if ( state.selectedPosts.indexOf( action.postGlobalId ) > -1 ) {
				return {
					...state,
					selectedPosts: without( state.selectedPosts, action.postGlobalId ),
				};
			}
			return { ...state, selectedPosts: [ ...state.selectedPosts, action.postGlobalId ] };
		case POST_TYPE_LIST_SHARE_PANEL_HIDE:
			return {
				...state,
				activeSharePanels: without( state.activeSharePanels, action.postGlobalId ),
			};
		case POST_TYPE_LIST_SHARE_PANEL_TOGGLE:
			if ( state.activeSharePanels.indexOf( action.postGlobalId ) > -1 ) {
				return {
					...state,
					activeSharePanels: without( state.activeSharePanels, action.postGlobalId ),
				};
			}
			return { ...state, activeSharePanels: [ action.postGlobalId ] };
	}

	return state;
};

export default postTypeList;
