/**
 * External dependencies
 */
import { combineReducers } from 'redux';

import {
	ACTIVATE_SUPPORT_USER,
	DEACTIVATE_SUPPORT_USER,
	FETCH_SUPPORT_USER_TOKEN,
	TOGGLE_SUPPORT_USER_DIALOG
} from 'state/action-types';

function isSupportUser( state = false, action ) {
	switch ( action.type ) {
		case ACTIVATE_SUPPORT_USER:
			return true;
		case DEACTIVATE_SUPPORT_USER:
			return false;
	}
	return state;
}

function userData( state = {}, action ) {
	switch ( action.type ) {
		case ACTIVATE_SUPPORT_USER:
			return action.userData;
		case DEACTIVATE_SUPPORT_USER:
			return null;
	}
	
	return state;
}

function showDialog( state = false, action ) {
	switch ( action.type ) {
		case TOGGLE_SUPPORT_USER_DIALOG:
			return !state;
		case ACTIVATE_SUPPORT_USER:
			return false;
		case DEACTIVATE_SUPPORT_USER:
			if ( action.error ) {
				// Only show the dialog if an error occurred
				return true;
			}
			return false;
	}

	return state;
}

function errorMessage( state = null, action ) {
	switch ( action.type ) {
		case FETCH_SUPPORT_USER_TOKEN:
			return null;
		case ACTIVATE_SUPPORT_USER:
			return null;
		case DEACTIVATE_SUPPORT_USER:
			if ( action.error ) {
				return action.error;
			}
			return null;
	}

	return state;
}

/**
 * True if currently in transition between normal and support user
 * @param  {Boolean} state
 * @param  {object}  action
 * @return {Boolean}
 */
function isTransitioning( state = false, action ) {
	switch ( action.type ) {
		case FETCH_SUPPORT_USER_TOKEN:
			return true;
		case ACTIVATE_SUPPORT_USER:
		case DEACTIVATE_SUPPORT_USER:
			return false;
	}

	return state;
}

export default combineReducers( {
	isSupportUser,
	userData,
	showDialog,
	errorMessage,
	isTransitioning
} );
