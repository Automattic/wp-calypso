/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import isFetchingNextPage from 'calypso/state/selectors/is-fetching-next-page';
import { requestMedia } from 'calypso/state/media/actions';
import getNextPageQuery from 'calypso/state/selectors/get-next-page-query';

const debug = debugFactory( 'calypso:media' );

/**
 * Redux thunk to fetch next page of media items
 *
 * @param {number} siteId site identifier
 */
export const fetchNextMediaPage = ( siteId ) => ( dispatch, getState ) => {
	if ( isFetchingNextPage( getState(), siteId ) ) {
		return;
	}

	const query = getNextPageQuery( getState(), siteId );

	debug( 'Fetching media for %d using query %o', siteId, query );

	dispatch( requestMedia( siteId, query ) );
};
