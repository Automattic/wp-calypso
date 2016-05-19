/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import lists from './lists/reducer';
import feeds from './feeds/reducer';
import sites from './sites/reducer';

export default combineReducers( {
	feeds,
	lists,
	sites
} );
