/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';

import { USER_DEVICES_ADD } from 'calypso/state/action-types';

const reducer = ( state = {}, action ) => {
	switch ( action.type ) {
		case USER_DEVICES_ADD: {
			const { devices } = action;
			return { ...state, ...devices };
		}
	}

	return state;
};

export default withStorageKey( 'userDevices', reducer );
