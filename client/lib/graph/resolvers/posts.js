/**
 * Internal dependencies
 */
import { getSitePostsForQuery } from 'state/posts/selectors';
import { requestSitePosts } from 'state/posts/actions';
import { resolvePost } from './post';
import { refreshByUid } from './utils';

const createResolver = store => ( args, { uid } ) => {
	const { siteId, query } = args;
	refreshByUid( store, uid, 'posts', args, () => {
		store.dispatch( requestSitePosts( siteId, query ) );
	} );
	const state = store.getState();
	const posts = getSitePostsForQuery( state, siteId, query );
	return posts ? posts.map( post => resolvePost( store, post ) ) : posts;
};

export default createResolver;
