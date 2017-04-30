/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import notices from './notices/reducer';
import settings from './settings/reducer';

export default combineReducers( {
	notices,
	settings,
} );
