/**
 * External dependencies
 */
import { combineReducers } from 'redux';

import {
	SUPPORT_USER_ACTIVATE,
	SUPPORT_USER_DEACTIVATE,
	SUPPORT_USER_TOKEN_FETCH,
	SUPPORT_USER_SWITCH,
	SUPPORT_USER_TOGGLE_DIALOG,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

export function shouldReloadPage( state = false, { type } ) {
	switch ( type ) {
		case SUPPORT_USER_SWITCH:
			return true;
		case SERIALIZE:
			return false;
		case DESERIALIZE:
			return false;
	}

	return state;
}

export function isSupportUser( state = false, { type } ) {
	switch ( type ) {
		case SUPPORT_USER_ACTIVATE:
			return true;
		case SUPPORT_USER_DEACTIVATE:
			return false;
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
		case SUPPORT_USER_SWITCH:
			return true;
		case SUPPORT_USER_DEACTIVATE:
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
		case SUPPORT_USER_SWITCH:
			return true;
		case SUPPORT_USER_DEACTIVATE:
			return true;
		case SERIALIZE:
			return false;
		case DESERIALIZE:
			return false;
	}

	return state;
}

export default combineReducers( {
	shouldReloadPage,
	isSupportUser,
	isTransitioning,
	showDialog,
} );
