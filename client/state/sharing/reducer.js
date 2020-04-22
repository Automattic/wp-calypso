/**
 * Internal dependencies
 */

import { CONNECTIONS_EXPANDED_SERVICE } from 'state/action-types';
import keyring from './keyring/reducer';
import { combineReducers, withoutPersistence } from 'state/utils';
import publicize from './publicize/reducer';
import services from './services/reducer';

export const expandedService = withoutPersistence( ( state = '', action ) => {
	switch ( action.type ) {
		case CONNECTIONS_EXPANDED_SERVICE:
			return action.serviceName;
	}

	return state;
} );

export default combineReducers( {
	keyring,
	publicize,
	services,
	expandedService,
} );
