/**
 * Internal dependencies
 */
import getNextPageHandle from 'calypso/state/selectors/get-next-page-handle';

export default function hasNextMediaPage( state, siteId ) {
	if (
		! ( siteId in state.media.fetching ) ||
		! ( 'nextPageHandle' in state.media.fetching[ siteId ] )
	) {
		// in these cases then the next page handle has not yet been set,
		// usually in the case of when the initial query has not yet returned,
		// so we assume one exists
		return true;
	}

	const nextPageHandle = getNextPageHandle( state, siteId );

	return nextPageHandle !== null;
}
