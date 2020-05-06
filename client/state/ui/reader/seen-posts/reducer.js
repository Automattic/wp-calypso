/**
 * Internal dependencies
 */
import { SERIALIZE, READER_UNSEEN_STATUS_ANY_RECEIVE } from 'state/action-types';

/**
 * Tracks the post key of the currently full viewed post
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export default ( state = false, action ) => {
	switch ( action.type ) {
		case READER_UNSEEN_STATUS_ANY_RECEIVE:
			return action.status;

		case SERIALIZE:
			return false;
	}
	return state;
};
