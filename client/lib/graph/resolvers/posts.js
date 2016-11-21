/**
 * Internal dependencies
 */
import {
	getSitePostsForQueryIgnoringPage,
	getSitePostsLastPageForQuery,
	isRequestingSitePostsForQuery
} from 'state/posts/selectors';
import { requestSitePosts } from 'state/posts/actions';
import { resolvePost } from './post';
import { refreshByUid } from './utils';

const createResolver = store => ( args, { uid } ) => {
	const state = store.getState();
	const { siteId, query, pages = [ 1 ] } = args;

	return {
		items: () => {
			pages.forEach( page => {
				refreshByUid( store, uid, 'posts', args, () => {
					store.dispatch( requestSitePosts( siteId, { ...query, page } ) );
				} );
			} );
			const posts = getSitePostsForQueryIgnoringPage( state, siteId, query );

			return posts ? posts.map( post => resolvePost( store, post, { uid } ) ) : posts;
		},
		requesting: () => pages.some(
			page => isRequestingSitePostsForQuery( state, siteId, { ...query, page } )
		),
		lastPage: () => getSitePostsLastPageForQuery( state, siteId, query )
	};
};

export default createResolver;
