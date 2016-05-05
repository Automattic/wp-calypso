/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import lists from './lists/reducer';
import start from './start/reducer';

export default combineReducers( {
	lists,
	start
} );
