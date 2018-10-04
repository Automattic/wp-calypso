/** @format */

/**
 * External dependencies
 */

import { combineReducers } from 'state/utils';
import { SUPPORT_USER_ACTIVATE } from 'state/action-types';

export function isSupportUser( state = false, { type } ) {
	switch ( type ) {
		case SUPPORT_USER_ACTIVATE:
			return true;
	}

	return state;
}

export default combineReducers( {
	isSupportUser,
} );
