/** @format */
/**
 * Internal dependencies
 */
import lists from './lists/reducer';
import { combineReducers } from 'state/utils';
import feeds from './feeds/reducer';
import follows from './follows/reducer';
import sites from './sites/reducer';
import posts from './posts/reducer';
import relatedPosts from './related-posts/reducer';
import siteBlocks from './site-blocks/reducer';
import tags from './tags/reducer';
import thumbnails from './thumbnails/reducer';
import teams from './teams/reducer';
import feedSearches from './feed-searches/reducer';
import recommendedSites from './recommended-sites/reducer';

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
