/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import { CONNECTION_LOST, CONNECTION_RESTORED } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

const connectionState = ( state = 'CHECKING', action ) => {
	switch ( action.type ) {
		case CONNECTION_LOST:
			return 'OFFLINE';
		case CONNECTION_RESTORED:
			return 'ONLINE';
	}

	return state;
};

export default withStorageKey( 'application', combineReducers( { connectionState } ) );
