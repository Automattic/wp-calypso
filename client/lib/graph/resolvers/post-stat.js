/**
 * Internal dependencies
 */
import { getPostStat, isRequestingPostStat } from 'state/stats/posts/selectors';
import { requestPostStat } from 'state/stats/posts/actions';

const createResolver = store => ( { siteId, postId, stat } ) => {
	const state = store.getState();

	// First Check if we need to request and request
	// We could also dispatch queries to the store (to avoid running requests multiple times)
	const statValue = getPostStat( state, stat, siteId, postId );
	const isRequesting = isRequestingPostStat( state, stat, siteId, postId );
	if ( ! statValue && ! isRequesting && siteId && postId && stat ) {
		setTimeout( () => store.dispatch( requestPostStat( stat, siteId, postId ) ) );
	}

	// Use Selectors to resolve the result
	return statValue;
};

export default createResolver;
