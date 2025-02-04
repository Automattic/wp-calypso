import { key, SCOPE_ALL } from './utils';

import 'calypso/state/reader/init';

export function shouldFetchRelated( state, siteId, postId, scope = SCOPE_ALL, size = 2 ) {
	return (
		state.reader.relatedPosts.items[ key( siteId, postId, scope, size ) ] === undefined &&
		! state.reader.relatedPosts.queuedRequests[ key( siteId, postId, scope, size ) ]
	);
}

export function relatedPostsForPost( state, siteId, postId, scope = SCOPE_ALL, size = 2 ) {
	return state.reader.relatedPosts.items[ key( siteId, postId, scope, size ) ];
}
