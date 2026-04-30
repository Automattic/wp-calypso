import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import conversations from './conversations/reducer';
import feedSearches from './feed-searches/reducer';
import feeds from './feeds/reducer';
import follows from './follows/reducer';
import posts from './posts/reducer';
import recommendedSites from './recommended-sites/reducer';
import relatedPosts from './related-posts/reducer';
import saved from './saved/reducer';
import siteBlocks from './site-blocks/reducer';
import sites from './sites/reducer';
import streams from './streams/reducer';

const combinedReducer = combineReducers( {
	conversations,
	feeds,
	feedSearches,
	follows,
	posts,
	recommendedSites,
	relatedPosts,
	saved,
	siteBlocks,
	sites,
	streams,
} );
const readerReducer = withStorageKey( 'reader', combinedReducer );
export default readerReducer;
