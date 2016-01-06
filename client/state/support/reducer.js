/**
 * External dependencies
 */
import { combineReducers } from 'redux';

import { ACTIVATE_SUPPORT_USER, DEACTIVATE_SUPPORT_USER } from 'state/action-types';

function isSupportUser( state = false, action ) {
	switch ( action.type ) {
		case ACTIVATE_SUPPORT_USER:
			return true;
		case DEACTIVATE_SUPPORT_USER:
			return false;
	}
	return state;
}

export default combineReducers( {
	isSupportUser
} );
