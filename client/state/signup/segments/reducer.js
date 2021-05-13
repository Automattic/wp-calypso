/**
 * Internal dependencies
 */

import { SIGNUP_SEGMENTS_SET } from 'calypso/state/action-types';

export default ( state = null, action ) => {
	switch ( action.type ) {
		case SIGNUP_SEGMENTS_SET:
			return action.segments;
	}

	return state;
};
