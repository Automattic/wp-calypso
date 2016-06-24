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
	ROUTE_SET,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

export function items( state = [], action ) {
	switch ( action.type ) {
		case NEW_NOTICE:
			return [ action.notice, ...state ];
		case REMOVE_NOTICE:
			return state.filter( ( notice ) => ( notice.noticeId !== action.noticeId ) );
		case ROUTE_SET:
			return state.filter( notice => {
				const show = notice.isPersistent || notice.displayOnNextPage;
				if ( notice.displayOnNextPage ) {
					notice.displayOnNextPage = false;
				}
				return show;
			} );
		case SERIALIZE:
			return [];
		case DESERIALIZE:
			return [];
	}
	return state;
}

export default combineReducers( {
	items
} );
