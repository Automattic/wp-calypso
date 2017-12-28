/** @format */

/**
 * Internal dependencies
 */

import { THEME_BACK_PATH_SET } from 'client/state/action-types';
import { combineReducers } from 'client/state/utils';

// Destination for 'back' button on theme sheet
function backPath( state = '/themes', action ) {
	switch ( action.type ) {
		case THEME_BACK_PATH_SET:
			return action.path !== undefined ? action.path : state;
	}
	return state;
}

export default combineReducers( { backPath } );
