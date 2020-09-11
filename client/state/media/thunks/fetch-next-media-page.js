/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import isFetchingNextPage from 'state/selectors/is-fetching-next-page';
import { dispatchFluxFetchMediaItems } from 'state/media/utils/flux-adapter';
import { requestMedia } from 'state/media/actions';
import getNextPageQuery from 'state/selectors/get-next-page-query';

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

	/*
	 * @TODO: Temporarily this action will dispatch to the flux store, until
	 * the flux store is removed. After we completely removed the flux store
	 * it should be enough to just call the `requestMedia( ... )` action
	 */
	dispatchFluxFetchMediaItems( siteId );

	const query = getNextPageQuery( getState(), siteId );

	debug( 'Fetching media for %d using query %o', siteId, query );

	dispatch( requestMedia( siteId, query ) );
};
