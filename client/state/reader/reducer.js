import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import conversations from './conversations/reducer';
import feedSearches from './feed-searches/reducer';
import feeds from './feeds/reducer';
import follows from './follows/reducer';
import lists from './lists/reducer';
import organizations from './organizations/reducer';
import posts from './posts/reducer';
import recommendedSites from './recommended-sites/reducer';
import relatedPosts from './related-posts/reducer';
import relatedSites from './related-sites/reducer';
import siteBlocks from './site-blocks/reducer';
import siteDismissals from './site-dismissals/reducer';
import sites from './sites/reducer';
import streams from './streams/reducer';
import tags from './tags/reducer';
import thumbnails from './thumbnails/reducer';

const combinedReducer = combineReducers( {
	conversations,
	feeds,
	feedSearches,
	follows,
	lists,
	posts,
	recommendedSites,
	relatedPosts,
	relatedSites,
	siteBlocks,
	siteDismissals,
	sites,
	streams,
	tags,
	thumbnails,
	organizations,
} );
const readerReducer = withStorageKey( 'reader', combinedReducer );
export default readerReducer;
