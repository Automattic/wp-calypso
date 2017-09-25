/**
 * Internal dependencies
 */
import keyring from './keyring/reducer';
import publicize from './publicize/reducer';
import services from './services/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	keyring,
	publicize,
	services,
} );
