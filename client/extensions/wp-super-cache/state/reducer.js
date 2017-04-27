/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import cacheTest from './cache-test/reducer';
import notices from './notices/reducer';
import settings from './settings/reducer';

export default combineReducers( {
	cacheTest,
	notices,
	settings,
} );
