/**
 * Internal dependencies
 */
import { isRequestingSitePostsForQuery } from 'state/posts/selectors';

const createResolver = store => ( { siteId, query } ) => {
	const state = store.getState();
	return isRequestingSitePostsForQuery( state, siteId, query );
};

export default createResolver;
