/**
 * External dependencies
 */
import { combineReducers } from 'redux';

import {
	SUPPORT_USER_ACTIVATED,
	SUPPORT_USER_DEACTIVATED,
	SUPPORT_USER_FETCH_TOKEN
} from 'state/action-types';

function isSupportUser( state = false, { type } ) {
	switch ( type ) {
		case SUPPORT_USER_ACTIVATED:
			return true;
		case SUPPORT_USER_DEACTIVATED:
			return false;
	}
	return state;
}

function userData( state = {}, { type, userData } ) {
	switch ( type ) {
		case SUPPORT_USER_ACTIVATED:
			return userData;
		case SUPPORT_USER_DEACTIVATED:
			return null;
	}
	
	return state;
}

function errorMessage( state = null, { type, error } ) {
	switch ( type ) {
		case SUPPORT_USER_FETCH_TOKEN:
			return null;
		case SUPPORT_USER_ACTIVATED:
			return null;
		case SUPPORT_USER_DEACTIVATED:
			if ( error ) {
				return error;
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
function isTransitioning( state = false, { type } ) {
	switch ( type ) {
		case SUPPORT_USER_FETCH_TOKEN:
			return true;
		case SUPPORT_USER_ACTIVATED:
		case SUPPORT_USER_DEACTIVATED:
			return false;
	}

	return state;
}

export default combineReducers( {
	isSupportUser,
	userData,
	errorMessage,
	isTransitioning
} );
