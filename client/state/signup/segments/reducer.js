/**
 * Internal dependencies
 */
import { withoutPersistence } from 'state/utils';
import { SIGNUP_SEGMENTS_SET } from 'state/action-types';

export default withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case SIGNUP_SEGMENTS_SET:
			return action.segments;
	}

	return state;
} );
