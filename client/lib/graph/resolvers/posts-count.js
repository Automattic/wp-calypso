/**
 * Internal dependencies
 */
import {
	getMyPostCounts,
	getAllPostCounts,
	isRequestingPostCounts
} from 'state/posts/counts/selectors';
import { requestPostCounts } from 'state/posts/counts/actions';
import { refreshByUid } from './utils';

const createResolver = store => ( args, { uid } ) => {
	const { siteId, postType } = args;
	refreshByUid( store, uid, 'posts-count', args, () => {
		store.dispatch( requestPostCounts( siteId, postType ) );
	} );
	const state = store.getState();

	return {
		mine: () => getMyPostCounts( state, siteId, postType ),
		all: () => getAllPostCounts( state, siteId, postType ),
		requesting: () => isRequestingPostCounts( state, siteId, postType )
	};
};

export default createResolver;
