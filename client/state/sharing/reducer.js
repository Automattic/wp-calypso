/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import publicize from './publicize/reducer';
import services from './keyring/services/reducer';

export default combineReducers( {
	publicize,
	services,
} );
