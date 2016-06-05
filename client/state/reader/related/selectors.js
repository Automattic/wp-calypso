import { key } from './utils';

export function shouldFetchRelated( state, siteId, postId ) {
	return ! state.reader.related.queuedRequests[ key( siteId, postId ) ];
}

export function relatedPostsForPost( state, siteId, postId ) {
	return state.reader.related.items[ key( siteId, postId ) ];
}
