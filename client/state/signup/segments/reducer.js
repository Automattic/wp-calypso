/**
 * Internal dependencies
 */
import { withoutPersistence } from 'calypso/state/utils';
import { SIGNUP_SEGMENTS_SET } from 'calypso/state/action-types';

export default withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case SIGNUP_SEGMENTS_SET:
			return action.segments;
	}

	return state;
} );
