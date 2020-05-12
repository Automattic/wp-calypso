/**
 * Internal dependencies
 */
import { SERIALIZE, READER_UNSEEN_STATUS_ANY_RECEIVE } from 'state/action-types';

export default ( state = false, action ) => {
	switch ( action.type ) {
		case READER_UNSEEN_STATUS_ANY_RECEIVE:
			return action.status;

		case SERIALIZE:
			return false;
	}
	return state;
};
