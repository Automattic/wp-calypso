/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import tags from './tags/reducer';
import lists from './lists/reducer';
import feeds from './feeds/reducer';
import follows from './follows/reducer';
import sites from './sites/reducer';
import start from './start/reducer';
import posts from './posts/reducer';
import relatedPosts from './related-posts/reducer';
import siteBlocks from './site-blocks/reducer';
import thumbnails from './thumbnails/reducer';
import teams from './teams/reducer';

export default combineReducers( {
	tags,
	feeds,
	follows,
	lists,
	sites,
	start,
	posts,
	relatedPosts,
	siteBlocks,
	thumbnails,
	teams,
} );
