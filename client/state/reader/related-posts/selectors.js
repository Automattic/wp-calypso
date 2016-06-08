import { key } from './utils';

export function shouldFetchRelated( state, siteId, postId ) {
	return ! state.reader.related_posts.queuedRequests[ key( siteId, postId ) ];
}

export function relatedPostsForPost( state, siteId, postId ) {
	return state.reader.related_posts.items[ key( siteId, postId ) ];
}
