/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	NEW_NOTICE,
	REMOVE_NOTICE
} from 'state/action-types';

export function items( state = [], action ) {
	switch ( action.type ) {
		case NEW_NOTICE:
			state = [ action.notice, ...state ];
			break;
		case REMOVE_NOTICE:
			state = state.filter( ( notice ) => ( notice.noticeId !== action.noticeId ) );
			break;
	}

	return state;
}

export default combineReducers( {
	items
} );
