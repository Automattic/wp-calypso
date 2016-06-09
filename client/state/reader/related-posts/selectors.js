import { key } from './utils';

export function shouldFetchRelated( state, siteId, postId ) {
	return ! state.reader.relatedPosts.queuedRequests[ key( siteId, postId ) ];
}

export function relatedPostsForPost( state, siteId, postId ) {
	return state.reader.relatedPosts.items[ key( siteId, postId ) ];
}
