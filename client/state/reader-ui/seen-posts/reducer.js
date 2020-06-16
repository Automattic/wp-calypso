/**
 * Internal dependencies
 */
import { SERIALIZE, READER_UNSEEN_STATUS_ANY_RECEIVE } from 'state/action-types';

/**
 * Reader Unseen status for any section (used global reader unseen bubble)
 *
 * @param state redux state
 * @param action redux action
 * @returns {boolean|*} redux state
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
