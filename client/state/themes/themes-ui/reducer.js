/**
 * Internal dependencies
 */

import { THEME_BACK_PATH_SET, THEMES_BOOKMARK_SET } from 'calypso/state/themes/action-types';
import { combineReducers } from 'calypso/state/utils';

// Destination for 'back' button on theme sheet
export function backPath( state = '/themes', action ) {
	switch ( action.type ) {
		case THEME_BACK_PATH_SET:
			return action.path !== undefined ? action.path : state;
	}
	return state;
}

export function themesBookmark( state = '', action ) {
	if ( THEMES_BOOKMARK_SET === action.type ) {
		return action.payload;
	}
	return state;
}

export default combineReducers( {
	backPath,
	themesBookmark,
} );
