/**
 * External dependencies
 */
 import map from 'lodash/map';

/**
 * Internal dependencies
 */
import config from 'config';
import { getPostBySiteAndId } from 'state/reader/posts/selectors';

const discoverBlogId = config( 'discover_blog_id' );

export function isRequestingDiscoveryPosts( state ) {
	return !! state.reader.discover.isRequestingDiscoveryPosts;
}

export function getDiscoverPosts( state ) {
	return state.reader.discover.items;
}

export function getDiscoverPostIds( state ) {
	return map( state.reader.discover.items, 'ID' );
}

export function getDiscoverPostById( state, postId ) {
	return getPostBySiteAndId( state, discoverBlogId, postId );
}
