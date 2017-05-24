/**
 * Internal dependencies
 */
import keyring from './keyring/reducer';
import { combineReducersWithPersistence } from 'state/utils';
import publicize from './publicize/reducer';
import services from './services/reducer';

export default combineReducersWithPersistence( {
	keyring,
	publicize,
	services,
} );
