/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import lists from './lists/reducer';
import feeds from './feeds/reducer';
import follows from './follows/reducer';
import sites from './sites/reducer';
import start from './start/reducer';
import posts from './posts/reducer';
import relatedPosts from './related-posts/reducer';
import tags from './tags/reducer';
import thumbnails from './thumbnails/reducer';

export default combineReducers( {
	feeds,
	follows,
	lists,
	sites,
	start,
	posts,
	relatedPosts,
	tags,
	thumbnails,
} );
