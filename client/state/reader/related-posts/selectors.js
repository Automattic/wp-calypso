/**
 * Internal Dependencies
 */
import { key, SCOPE_ALL } from './utils';

import 'state/reader/reducer';

export function shouldFetchRelated( state, siteId, postId, scope = SCOPE_ALL ) {
	return (
		state.reader.relatedPosts.items[ key( siteId, postId, scope ) ] === undefined &&
		! state.reader.relatedPosts.queuedRequests[ key( siteId, postId, scope ) ]
	);
}

export function relatedPostsForPost( state, siteId, postId, scope = SCOPE_ALL ) {
	return state.reader.relatedPosts.items[ key( siteId, postId, scope ) ];
}
