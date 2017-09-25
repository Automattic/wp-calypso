/** @format */
/**
 * Internal dependencies
 */
import feedSearches from './feed-searches/reducer';
import feeds from './feeds/reducer';
import follows from './follows/reducer';
import lists from './lists/reducer';
import posts from './posts/reducer';
import recommendedSites from './recommended-sites/reducer';
import relatedPosts from './related-posts/reducer';
import siteBlocks from './site-blocks/reducer';
import sites from './sites/reducer';
import tags from './tags/reducer';
import teams from './teams/reducer';
import thumbnails from './thumbnails/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	feeds,
	follows,
	lists,
	sites,
	posts,
	relatedPosts,
	siteBlocks,
	tags,
	thumbnails,
	teams,
	feedSearches,
	recommendedSites,
} );
