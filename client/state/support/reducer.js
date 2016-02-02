/**
 * External dependencies
 */
import { combineReducers } from 'redux';

import {
	SUPPORT_USER_TOKEN_FETCH,
	SUPPORT_USER_TOKEN_SET,
	SUPPORT_USER_RESTORE,
} from 'state/action-types';

export function isSupportUser( state = false, action ) {
	switch ( action.type ) {
		case SUPPORT_USER_TOKEN_SET:
			return !! ( action.supportUser && action.supportToken );
		case SUPPORT_USER_RESTORE:
			return false;
	}
	return state;
}

export function supportUser( state = '', action ) {
	switch ( action.type ) {
		case SUPPORT_USER_TOKEN_SET:
			return action.supportUser;
		case SUPPORT_USER_RESTORE:
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
	}
	return state;
}

export default combineReducers( {
	isSupportUser,
	supportUser,
	supportToken,
} );
