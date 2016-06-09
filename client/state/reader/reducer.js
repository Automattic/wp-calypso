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
import start from './start/reducer';
import posts from './posts/reducer';
import relatedPosts from './related-posts/reducer';

export default combineReducers( {
	feeds,
	lists,
	sites,
	start,
	posts,
	relatedPosts
} );
