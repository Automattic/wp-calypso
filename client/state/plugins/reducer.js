/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import wporg from './wporg/reducer';
import premium from './premium/reducer';

export default combineReducers( {
	wporg,
	premium
} );
