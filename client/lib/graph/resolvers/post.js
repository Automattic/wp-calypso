/**
 * Internal dependencies
 */
import { getSitePost, isRequestingSitePost } from 'state/posts/selectors';
import { requestSitePost } from 'state/posts/actions';
import createPostStatResolver from './post-stat';

export const resolvePost = ( store, post ) => {
	if ( ! post ) {
		return post;
	}
	return {
		...post,
		stat: ( { stat } ) => createPostStatResolver( store )( {
			siteId: post.site_ID,
			postId: post.ID,
			stat
		} )
	};
};

const createResolver = store => ( { siteId, postId } ) => {
	const state = store.getState();

	// First Check if we need to request and request
	// We could also dispatch queries to the store (to avoid running requests multiple times)
	const post = getSitePost( state, siteId, postId );
	const isRequesting = isRequestingSitePost( state, siteId, postId );
	if ( ! post && ! isRequesting && siteId && postId ) {
		setTimeout( () => store.dispatch( requestSitePost( siteId, postId ) ) );
	}

	// Use Selectors to resolve the result
	return resolvePost( store, post );
};

export default createResolver;
