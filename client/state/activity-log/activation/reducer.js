/**
 * Internal dependencies
 */
import {
	REWIND_ACTIVATE_FAILURE,
	REWIND_ACTIVATE_REQUEST,
	REWIND_ACTIVATE_SUCCESS,
} from 'calypso/state/action-types';
import { keyedReducer } from 'calypso/state/utils';

export const activationRequesting = keyedReducer( 'siteId', ( state = false, action ) => {
	switch ( action.type ) {
		case REWIND_ACTIVATE_REQUEST:
			return true;
		case REWIND_ACTIVATE_SUCCESS:
		case REWIND_ACTIVATE_FAILURE:
			return false;
	}

	return state;
} );
