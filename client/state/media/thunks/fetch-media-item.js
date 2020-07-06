/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { requestMediaItem } from 'state/media/actions';
import { dispatchFluxFetchMediaItem } from 'state/media/utils/flux-adapter';

const debug = debugFactory( 'calypso:media' );

export const fetchMediaItem = ( siteId, mediaId ) => ( dispatch ) => {
	debug( 'Fetching media for %d using ID %d', siteId, mediaId );

	dispatch( requestMediaItem( siteId, mediaId ) );

	dispatchFluxFetchMediaItem( siteId, mediaId );
};
