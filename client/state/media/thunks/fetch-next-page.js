/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import isFetchingNextPage from 'state/selectors/is-fetching-next-page';
import MediaListStore from 'lib/media/list-store';
import { dispatchFluxFetchMediaItems } from 'state/media/utils/flux-adapter';
import { requestMedia } from 'state/media/actions';

const debug = debugFactory( 'calypso:media' );

/**
 * Redux thunk to edit a media item.
 *
 * Note: Temporarily this action will dispatch to the flux store, until
 * the flux store is removed.
 *
 * @param {number} siteId site identifier
 */
export const fetchNextPage = ( siteId ) => ( dispatch, getState ) => {
	if ( isFetchingNextPage( getState(), siteId ) ) {
		return;
	}

	dispatchFluxFetchMediaItems( siteId );

	const query = MediaListStore.getNextPageQuery( siteId );

	debug( 'Fetching media for %d using query %o', siteId, query );

	dispatch( requestMedia( siteId, query ) );
};
