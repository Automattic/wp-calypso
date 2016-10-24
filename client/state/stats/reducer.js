/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import posts from './posts/reducer';
import lists from './lists/reducer';

export default combineReducers( {
	posts,
	lists
} );
