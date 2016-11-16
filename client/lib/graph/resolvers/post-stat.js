/**
 * Internal dependencies
 */
import { getPostStat } from 'state/stats/posts/selectors';
import { requestPostStat } from 'state/stats/posts/actions';
import { refreshWhenExpired } from './utils';

const createResolver = store => ( args ) => {
	const { siteId, postId, stat } = args;
	refreshWhenExpired( store, 'post-stat', args, 30000, () => {
		store.dispatch( requestPostStat( stat, siteId, postId ) );
	} );
	const state = store.getState();
	const statValue = getPostStat( state, stat, siteId, postId );
	return statValue;
};

export default createResolver;
