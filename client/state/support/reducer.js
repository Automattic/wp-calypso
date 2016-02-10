/**
 * External dependencies
 */
import { combineReducers } from 'redux';

import {
	SUPPORT_USER_TOKEN_FETCH,
	SUPPORT_USER_TOKEN_SET,
	SUPPORT_USER_RESTORE,
	SUPPORT_USER_TOGGLE_DIALOG,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

export function supportUser( state = '', action ) {
	switch ( action.type ) {
		case SUPPORT_USER_TOKEN_SET:
			return action.supportUser;
		case SUPPORT_USER_RESTORE:
			return '';
		case SERIALIZE:
			return '';
		case DESERIALIZE:
			return '';
	}
	return state;
}

export function supportToken( state = '', action ) {
	switch ( action.type ) {
		case SUPPORT_USER_TOKEN_SET:
			return action.supportToken;
		case SUPPORT_USER_RESTORE:
			return '';
		case SERIALIZE:
			return '';
		case DESERIALIZE:
			return '';
	}
	return state;
}

export function isTransitioning( state = false, { type } ) {
	switch ( type ) {
		case SUPPORT_USER_TOKEN_FETCH:
			return true;
		case SUPPORT_USER_TOKEN_SET:
		case SUPPORT_USER_RESTORE:
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
			return !state;
		case SUPPORT_USER_TOKEN_SET:
		case SUPPORT_USER_RESTORE:
			return false;
		case SERIALIZE:
			return false;
		case DESERIALIZE:
			return false;
	}

	return state;
}

export default combineReducers( {
	supportUser,
	supportToken,
	isTransitioning,
	showDialog,
} );
