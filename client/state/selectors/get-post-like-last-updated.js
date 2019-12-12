/**
 * External dependencies
 */
import { get } from 'lodash';

export default function getPostLikeLastUpdated( state, siteId, postId ) {
	return get( state.posts.likes.items, [ siteId, postId, 'lastUpdated' ] );
}
