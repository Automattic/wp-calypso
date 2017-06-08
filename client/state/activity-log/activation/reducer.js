/**
 * Internal dependencies
 */
import {
	REWIND_ACTIVATE_FAILURE,
	REWIND_ACTIVATE_REQUEST,
	REWIND_ACTIVATE_SUCCESS,
} from 'state/action-types';
import { keyedReducer } from 'state/utils';

export const activationRequesting = keyedReducer( 'siteId', ( state = undefined, { type } ) => {
	switch ( type ) {
		// Request starts
		case REWIND_ACTIVATE_REQUEST:
			return true;

		// Request ends
		case REWIND_ACTIVATE_FAILURE:
		case REWIND_ACTIVATE_SUCCESS:
			return false;
	}
	return state;
} );
