/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import {
	NEW_NOTICE,
	REMOVE_NOTICE
} from './action-types';

/**
 * Tracks all known site objects, indexed by site ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = [], action ) {
	switch ( action.type ) {
		case NEW_NOTICE:
			state = [ action, ...state ];
			break;
		case REMOVE_NOTICE:
			state = filter( state, ( notice ) => ( notice.noticeId !== action.noticeId ) );
			break;
	}

	return state;
}

export default combineReducers( {
	items
} );
