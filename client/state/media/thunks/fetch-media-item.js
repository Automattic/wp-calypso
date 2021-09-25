import debugFactory from 'debug';
import { requestMediaItem } from 'calypso/state/media/actions';

const debug = debugFactory( 'calypso:media' );

export const fetchMediaItem = ( siteId, mediaId ) => ( dispatch ) => {
	debug( 'Fetching media for %d using ID %d', siteId, mediaId );

	dispatch( requestMediaItem( siteId, mediaId ) );
};
