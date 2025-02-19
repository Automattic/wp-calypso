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
import siteBlocks from './site-blocks/reducer';
import sites from './sites/reducer';
import streams from './streams/reducer';
import tags from './tags/reducer';
import thumbnails from './thumbnails/reducer';
import users from './users/reducer';

const combinedReducer = combineReducers( {
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
	thumbnails,
	organizations,
	users,
} );
const readerReducer = withStorageKey( 'reader', combinedReducer );
export default readerReducer;
