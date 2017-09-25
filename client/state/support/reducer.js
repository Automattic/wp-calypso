/**
 * Internal dependencies
 */
import { SUPPORT_USER_ACTIVATE, SUPPORT_USER_TOKEN_FETCH, SUPPORT_USER_ERROR, SUPPORT_USER_PREFILL, SUPPORT_USER_SET_USERNAME, SUPPORT_USER_TOGGLE_DIALOG } from 'state/action-types';
import { combineReducers } from 'state/utils';

export function isSupportUser( state = false, { type } ) {
	switch ( type ) {
		case SUPPORT_USER_ACTIVATE:
			return true;
	}

	return state;
}

export function isTransitioning( state = false, { type } ) {
	switch ( type ) {
		case SUPPORT_USER_TOKEN_FETCH:
			return true;
		case SUPPORT_USER_ERROR:
			return false;
	}
	return state;
}

export function showDialog( state = false, { type } ) {
	switch ( type ) {
		case SUPPORT_USER_TOGGLE_DIALOG:
			return ! state;
		case SUPPORT_USER_ERROR:
			return true;
		case SUPPORT_USER_PREFILL:
			return true;
	}

	return state;
}

export function errorMessage( state = null, action ) {
	switch ( action.type ) {
		case SUPPORT_USER_ERROR:
			return action.errorMessage;
		case SUPPORT_USER_ACTIVATE:
			return null;
	}

	return state;
}

export function username( state = null, action ) {
	switch ( action.type ) {
		case SUPPORT_USER_PREFILL:
		case SUPPORT_USER_SET_USERNAME:
			return action.username;
	}
	return state;
}

export default combineReducers( {
	errorMessage,
	isSupportUser,
	isTransitioning,
	showDialog,
	username,
} );
