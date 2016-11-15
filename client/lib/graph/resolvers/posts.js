/**
 * Internal dependencies
 */
import { getSitePostsForQuery, isRequestingSitePostsForQuery } from 'state/posts/selectors';
import { requestSitePosts } from 'state/posts/actions';
import { resolvePost } from './post';

const createResolver = store => ( { siteId, query } ) => {
	const state = store.getState();

	// First Check if we need to request and request
	// We could also dispatch queries to the store (to avoid running requests multiple times)
	const posts = getSitePostsForQuery( state, siteId, query );
	const isRequesting = isRequestingSitePostsForQuery( state, siteId, query );
	if ( ! posts && ! isRequesting && siteId ) {
		setTimeout( () => store.dispatch( requestSitePosts( siteId, query ) ) );
	}

	// Use Selectors to resolve the result
	return posts ? posts.map( post => resolvePost( store, post ) ) : posts;
};

export default createResolver;
