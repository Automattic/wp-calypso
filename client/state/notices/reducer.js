/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import findIndex from 'lodash/findIndex';

/**
 * Internal dependencies
 */
import {
	NEW_NOTICE,
	REMOVE_NOTICE,
	SET_ROUTE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

export function items( state = [], action ) {
	switch ( action.type ) {
		case NEW_NOTICE:
			const oldNoticeIndex = findIndex( state, { noticeId: action.notice.noticeId } );

			if ( oldNoticeIndex === -1 ) {
				return [ action.notice, ...state ];
			}

			return [
				...state.slice( 0, oldNoticeIndex ),
				action.notice,
				...state.slice( oldNoticeIndex + 1 )
			];
		case REMOVE_NOTICE:
			return state.filter( ( notice ) => ( notice.noticeId !== action.noticeId ) );
		case SET_ROUTE:
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
