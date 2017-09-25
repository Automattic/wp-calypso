/**
 * External dependencies
 */
import { without } from 'lodash';

/**
 * Internal dependencies
 */
import { POST_TYPE_LIST_SHARE_PANEL_HIDE, POST_TYPE_LIST_SHARE_PANEL_TOGGLE } from 'state/action-types';

const initialState = {
	activeSharePanels: [],
};

export const postTypeList = ( state = initialState, action ) => {
	switch ( action.type ) {
		case POST_TYPE_LIST_SHARE_PANEL_HIDE:
			return { ...state, activeSharePanels: without( state.activeSharePanels, action.postGlobalId ) };
		case POST_TYPE_LIST_SHARE_PANEL_TOGGLE:
			if ( state.activeSharePanels.indexOf( action.postGlobalId ) > -1 ) {
				return { ...state, activeSharePanels: without( state.activeSharePanels, action.postGlobalId ) };
			}
			return { ...state, activeSharePanels: [ action.postGlobalId ] };
	}

	return state;
};

export default postTypeList;
