/**
 * Internal dependencies
 */
import {
	READER_SEEN_UNSEEN_STATUS_ALL_RECEIVE,
	READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_ALL_AS_UNSEEN_RECEIVE,
} from 'state/reader/action-types';
import { SERIALIZE } from 'state/action-types';
import { combineReducers } from 'state/utils';

/**
 * Reader Unseen status for all sections
 *
 * @param state redux state
 * @param action redux action
 * @returns {{}|*} redux state
 */
export function unseenStatus( state = {}, action ) {
	switch ( action.type ) {
		case READER_SEEN_UNSEEN_STATUS_ALL_RECEIVE:
			return action.sections;

		case READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE:
			return {
				...state,
				[ action.section ]: {
					...state[ action.section ],
					status: false,
				},
			};

		case READER_SEEN_MARK_ALL_AS_UNSEEN_RECEIVE:
			return {
				...state,
				[ action.section ]: {
					...state[ action.section ],
					status: true,
				},
			};

		case SERIALIZE:
			return {};
	}
	return state;
}

export default combineReducers( {
	unseenStatus,
} );
