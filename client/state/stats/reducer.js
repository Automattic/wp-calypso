/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import posts from './posts/reducer';

export default combineReducers( {
	posts
} );
