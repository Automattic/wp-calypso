/**
 * Internal dependencies
 */

import { withoutPersistence, withStorageKey } from 'calypso/state/utils';
import { USER_DEVICES_ADD } from 'calypso/state/action-types';

const reducer = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case USER_DEVICES_ADD: {
			const { devices } = action;
			return { ...state, ...devices };
		}
	}

	return state;
} );

export default withStorageKey( 'userDevices', reducer );
