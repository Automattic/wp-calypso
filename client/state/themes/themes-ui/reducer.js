/**
 * Internal dependencies
 */

import {
	THEME_BACK_PATH_SET,
	THEMES_BANNER_HIDE,
	THEMES_SHOWCASE_OPEN,
	THEMES_BROWSING_STATE_SET,
} from 'state/action-types';
import { themesBannerVisibleSchema } from '../schema';
import { combineReducers, withSchemaValidation } from 'state/utils';

// Destination for 'back' button on theme sheet
export function backPath( state = '/themes', action ) {
	switch ( action.type ) {
		case THEME_BACK_PATH_SET:
			return action.path !== undefined ? action.path : state;
	}
	return state;
}

// Themes banner visible state
export function themesBannerVisibleReducer( state = true, { type } ) {
	if ( THEMES_BANNER_HIDE === type ) {
		return false;
	}
	return state;
}

export const themesBannerVisible = withSchemaValidation(
	themesBannerVisibleSchema,
	themesBannerVisibleReducer
);

// "More Themes" button state.
export function themesShowcaseOpen( state = false, action ) {
	if ( THEMES_SHOWCASE_OPEN === action.type ) {
		return true;
	}
	return state;
}

const initialBrowsingState = {
	scrollPosition: 0,
	search: '',
	filter: '',
};

export function themesBrowsingTracker( state = initialBrowsingState, action ) {
	if ( THEMES_BROWSING_STATE_SET === action.type ) {
		return { ...state, ...action.payload };
	}
	return state;
}

export default combineReducers( {
	backPath,
	themesBannerVisible,
	themesShowcaseOpen,
	themesBrowsingTracker,
} );
