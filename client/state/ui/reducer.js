/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { SET_SELECTED_SITE } from 'state/action-types';

/**
 * Tracks the currently selected site ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function selectedSite( state = null, action ) {
	switch ( action.type ) {
		case SET_SELECTED_SITE:
			state = action.siteId;
			break;
	}

	return state;
}

export default combineReducers( {
	selectedSite
} );
