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
 * Tracks the post key of the currently full viewed post
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function status( state = {}, action ) {
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
	status,
} );
