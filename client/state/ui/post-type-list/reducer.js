/** @format */

/**
 * External dependencies
 */

import { without } from 'lodash';

/**
 * Internal dependencies
 */
import {
	POST_TYPE_LIST_MULTI_SELECTION_MODE_TOGGLE,
	POST_TYPE_LIST_SELECTION_TOGGLE,
	POST_TYPE_LIST_SHARE_PANEL_HIDE,
	POST_TYPE_LIST_SHARE_PANEL_TOGGLE,
	ROUTE_SET,
} from 'state/action-types';

const initialState = {
	activeSharePanels: [],
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
				selectedPosts: [],
			};

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
			return {
				...state,
				activeSharePanels: [ action.postGlobalId ],
			};
	}

	return state;
};

export default postTypeList;
