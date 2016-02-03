/**
 * External dependencies
 */
import { combineReducers } from 'redux';

import {
	SUPPORT_USER_TOKEN_FETCH,
	SUPPORT_USER_TOKEN_SET,
	SUPPORT_USER_RESTORE,
} from 'state/action-types';

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
	supportUser,
	supportToken,
} );
