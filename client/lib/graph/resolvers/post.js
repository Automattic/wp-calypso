/**
 * Internal dependencies
 */
import { getSitePost } from 'state/posts/selectors';
import { requestSitePost } from 'state/posts/actions';
import { refreshByUid } from './utils';
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

const createResolver = store => ( args, { uid } ) => {
	const { siteId, postId } = args;
	refreshByUid( store, uid, 'post', args, () => {
		store.dispatch( requestSitePost( siteId, postId ) );
	} );
	const state = store.getState();
	const post = getSitePost( state, siteId, postId );
	return resolvePost( store, post );
};

export default createResolver;
