/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	NEW_NOTICE,
	REMOVE_NOTICE,
	SET_ROUTE
} from 'state/action-types';

export function items( state = [], action ) {
	switch ( action.type ) {
		case NEW_NOTICE:
			state = [ action.notice, ...state ];
			break;
		case REMOVE_NOTICE:
			state = state.filter( ( notice ) => ( notice.noticeId !== action.noticeId ) );
			break;
		case SET_ROUTE:
			state = state.filter( notice => {
				const show = notice.isPersistent || notice.displayOnNextPage;
				if ( notice.displayOnNextPage ) {
					notice.displayOnNextPage = false;
				}
				return show;
			} );
			break
	}

	return state;
}

export default combineReducers( {
	items
} );
