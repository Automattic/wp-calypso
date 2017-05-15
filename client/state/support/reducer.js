/**
 * External dependencies
 */
import { combineReducers } from 'redux';

import {
	SUPPORT_USER_ACTIVATE,
	SUPPORT_USER_TOKEN_FETCH,
	SUPPORT_USER_ERROR,
	SUPPORT_USER_PREFILL,
	SUPPORT_USER_SET_USERNAME,
	SUPPORT_USER_TOGGLE_DIALOG,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

export function isSupportUser( state = false, { type } ) {
	switch ( type ) {
		case SUPPORT_USER_ACTIVATE:
			return true;
		case SERIALIZE:
			return false;
		case DESERIALIZE:
			return false;
	}

	return state;
}

export function isTransitioning( state = false, { type } ) {
	switch ( type ) {
		case SUPPORT_USER_TOKEN_FETCH:
			return true;
		case SUPPORT_USER_ERROR:
			return false;
		case SERIALIZE:
			return false;
		case DESERIALIZE:
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
		case SERIALIZE:
			return false;
		case DESERIALIZE:
			return false;
	}

	return state;
}

export function errorMessage( state = null, action ) {
	switch ( action.type ) {
		case SUPPORT_USER_ERROR:
			return action.errorMessage;
		case SUPPORT_USER_ACTIVATE:
			return null;
		case SERIALIZE:
			return null;
		case DESERIALIZE:
			return null;
	}

	return state;
}

export function username( state = null, action ) {
	switch ( action.type ) {
		case SUPPORT_USER_PREFILL:
		case SUPPORT_USER_SET_USERNAME:
			return action.username;
		case SERIALIZE:
			return null;
		case DESERIALIZE:
			return null;
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
