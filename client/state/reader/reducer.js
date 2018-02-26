/** @format */
/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';

import conversations from './conversations/reducer';
import feeds from './feeds/reducer';
import feedSearches from './feed-searches/reducer';
import follows from './follows/reducer';
import lists from './lists/reducer';
import posts from './posts/reducer';
import recommendedSites from './recommended-sites/reducer';
import relatedPosts from './related-posts/reducer';
import siteBlocks from './site-blocks/reducer';
import sites from './sites/reducer';
import streams from './streams/reducer';
import tags from './tags/reducer';
import teams from './teams/reducer';
import thumbnails from './thumbnails/reducer';

export default combineReducers( {
	conversations,
	feeds,
	feedSearches,
	follows,
	lists,
	posts,
	recommendedSites,
	relatedPosts,
	siteBlocks,
	sites,
	streams,
	tags,
	teams,
	thumbnails,
} );
