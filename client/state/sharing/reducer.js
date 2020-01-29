/**
 * Internal dependencies
 */

import keyring from './keyring/reducer';
import { combineReducers } from 'state/utils';
import publicize from './publicize/reducer';
import services from './services/reducer';

export default combineReducers( {
	keyring,
	publicize,
	services,
} );
