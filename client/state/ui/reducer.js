/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	SET_SELECTED_SITE,
	SET_SECTION,
	CURRENT_USER_ID_SET
} from 'state/action-types';

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
			state = action.siteId || null;
			break;
	}

	return state;
}

/**
 * Tracks the current user ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function currentUserId( state = null, action ) {
	switch ( action.type ) {
		case CURRENT_USER_ID_SET:
			state = action.userId;
			break;
	}

	return state;
}

export function section( state = false, action ) {
	if ( action.type === SET_SECTION && action.section !== undefined ) {
		state = action.section;
	}
	return state;
}

export function hasSidebar( state = true, action ) {
	if ( action.type === SET_SECTION && action.hasSidebar !== undefined ) {
		state = action.hasSidebar;
	}
	return state;
}

export function isLoading( state = false, action ) {
	if ( action.type === SET_SECTION && action.isLoading !== undefined ) {
		state = action.isLoading;
	}
	return state;
}

export default combineReducers( {
	section,
	isLoading,
	hasSidebar,
	selectedSite,
	currentUserId
} );
