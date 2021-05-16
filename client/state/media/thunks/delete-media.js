import debugFactory from 'debug';
import { deleteMediaItem } from 'calypso/state/media/actions';

const debug = debugFactory( 'calypso:media' );

/**
 * Redux thunk to edit a media item.
 *
 * @param {number} siteId site identifier
 * @param {object} item edited media item
 */
export const deleteMedia = ( siteId, item ) => ( dispatch ) => {
	debug( 'Deleting media from %d by ID %d', siteId, item.ID );

	// don't attempt to delete transient items
	const items = Array.isArray( item ) ? item : [ item ];

	items
		.filter( ( id ) => typeof id === 'number' )
		.forEach( ( id ) => {
			dispatch( deleteMediaItem( siteId, id ) );
		} );
};
