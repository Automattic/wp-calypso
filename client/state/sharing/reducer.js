/** @format */

/**
 * Internal dependencies
 */

import keyring from './keyring/reducer';
import { combineReducers } from 'client/state/utils';
import publicize from './publicize/reducer';
import services from './services/reducer';

export default combineReducers( {
	keyring,
	publicize,
	services,
} );
