/** @format */

/**
 * Internal dependencies
 */

import { THEME_BACK_PATH_SET, THEMES_BANNER_HIDE } from 'state/action-types';
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

export default combineReducers( { backPath, themesBannerVisible } );
