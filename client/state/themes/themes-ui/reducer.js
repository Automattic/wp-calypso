/** @format */

/**
 * Internal dependencies
 */

import { THEME_BACK_PATH_SET, THEMES_BANNER_HIDE } from 'state/action-types';
import { themesBannerVisibleSchema } from '../schema';
import { combineReducers, createReducer } from 'state/utils';

// Destination for 'back' button on theme sheet
function backPath( state = '/themes', action ) {
	switch ( action.type ) {
		case THEME_BACK_PATH_SET:
			return action.path !== undefined ? action.path : state;
	}
	return state;
}

// Determines if the theme showcase banner is currently visible
const themesBannerVisible = createReducer(
	true,
	{
		[ THEMES_BANNER_HIDE ]: () => false,
	},
	themesBannerVisibleSchema
);

export default combineReducers( { backPath, themesBannerVisible } );
