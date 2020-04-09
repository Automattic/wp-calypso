/**
 * Internal dependencies
 */
import { combineReducers, withStorageKey } from 'state/utils';

import conversations from './conversations/reducer';
import fullView from './full-view/reducer';
import feeds from './feeds/reducer';
import feedSearches from './feed-searches/reducer';
import follows from './follows/reducer';
import lists from './lists/reducer';
import posts from './posts/reducer';
import recommendedSites from './recommended-sites/reducer';
import relatedPosts from './related-posts/reducer';
import siteBlocks from './site-blocks/reducer';
import siteDismissals from './site-dismissals/reducer';
import sites from './sites/reducer';
import streams from './streams/reducer';
import tags from './tags/reducer';
import teams from './teams/reducer';
import thumbnails from './thumbnails/reducer';

const combinedReducer = combineReducers( {
	conversations,
	feeds,
	feedSearches,
	follows,
	fullView,
	lists,
	posts,
	recommendedSites,
	relatedPosts,
	siteBlocks,
	siteDismissals,
	sites,
	streams,
	tags,
	teams,
	thumbnails,
} );
const readerReducer = withStorageKey( 'reader', combinedReducer );
export default readerReducer;
