/**
 * Internal dependencies
 */

import { CONNECTION_LOST, CONNECTION_RESTORED } from 'state/action-types';
import { combineReducers, withoutPersistence } from 'state/utils';

export const connectionState = withoutPersistence( ( state = 'CHECKING', action ) => {
	switch ( action.type ) {
		case CONNECTION_LOST:
			return 'OFFLINE';
		case CONNECTION_RESTORED:
			return 'ONLINE';
	}

	return state;
} );

export default combineReducers( {
	connectionState,
} );
