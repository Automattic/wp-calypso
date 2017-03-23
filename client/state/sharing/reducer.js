/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import keyring from './keyring/reducer';
import publicize from './publicize/reducer';
import services from './services/reducer';

export default combineReducers({
    keyring,
    publicize,
    services,
});
