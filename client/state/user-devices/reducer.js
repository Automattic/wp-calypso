/**
 * Internal dependencies
 */

import { withoutPersistence } from 'calypso/state/utils';
import { USER_DEVICES_ADD } from 'calypso/state/action-types';

export default withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case USER_DEVICES_ADD: {
			const { devices } = action;
			return { ...state, ...devices };
		}
	}

	return state;
} );
