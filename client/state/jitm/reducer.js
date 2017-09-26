/**
 * Internal dependencies
 */
import {
	JITM_SET,
} from 'state/action-types';
import { combineReducers } from 'state/utils';

export function getJITM( state = {}, action ) {
	switch ( action.type ) {
		case JITM_SET:
			return Object.assign( {}, state, {
				data: action.jitms
			} );
	}

	return state;
}

export default combineReducers( {
	jitms: getJITM
} );
