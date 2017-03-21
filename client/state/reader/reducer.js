/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import feeds from './feeds/reducer';
import follows from './follows/reducer';
import lists from './lists/reducer';
import posts from './posts/reducer';
import relatedPosts from './related-posts/reducer';
import siteBlocks from './site-blocks/reducer';
import sites from './sites/reducer';
import start from './start/reducer';
import streams from './streams/reducer';
import tags from './tags/reducer';
import thumbnails from './thumbnails/reducer';
import teams from './teams/reducer';

export default combineReducers( {
	feeds,
	follows,
	lists,
	posts,
	relatedPosts,
	siteBlocks,
	sites,
	start,
	streams,
	tags,
	thumbnails,
	teams,
} );
