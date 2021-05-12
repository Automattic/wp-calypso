/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import { CONNECTIONS_SET_EXPANDED_SERVICE } from 'calypso/state/action-types';
import keyring from './keyring/reducer';
import { combineReducers } from 'calypso/state/utils';
import publicize from './publicize/reducer';
import services from './services/reducer';

export const expandedService = ( state = '', action ) => {
	switch ( action.type ) {
		case CONNECTIONS_SET_EXPANDED_SERVICE:
			return action.serviceName ? action.serviceName : null;
	}

	return state;
};

const combinedReducer = combineReducers( {
	keyring,
	publicize,
	services,
	expandedService,
} );

export default withStorageKey( 'sharing', combinedReducer );
