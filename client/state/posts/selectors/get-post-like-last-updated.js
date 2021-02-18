/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/posts/init';

export function getPostLikeLastUpdated( state, siteId, postId ) {
	return get( state.posts.likes.items, [ siteId, postId, 'lastUpdated' ] );
}
