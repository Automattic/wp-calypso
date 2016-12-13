/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import reset from './reset/reducer';
import settings from './settings/reducer';

export default combineReducers( {
	settings,
	reset,
} );
