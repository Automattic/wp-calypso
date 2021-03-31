/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { deleteMediaItem } from 'calypso/state/media/actions';

const debug = debugFactory( 'calypso:media' );

/**
 * Redux thunk to edit a media item.
 *
 * Note: Temporarily this action will dispatch to the flux store, until
 * the flux store is removed.
 *
 * @param {number} siteId site identifier
 * @param {object} item edited media item
 */
export const deleteMedia = ( siteId, item ) => ( dispatch ) => {
	debug( 'Deleting media from %d by ID %d', siteId, item.ID );

	// don't attempt to delete transient items
	const items = Array.isArray( item ) ? item : [ item ];

	items
		.filter( ( i ) => typeof i.ID === 'number' )
		.forEach( ( mediaItem ) => {
			dispatch( deleteMediaItem( siteId, mediaItem.ID ) );
		} );
};
