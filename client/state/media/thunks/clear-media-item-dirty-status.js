/**
 * External dependencies
 */
import { assign } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchFluxUpdateMediaItem } from 'state/media/utils/flux-adapter';
import getMediaItem from 'state/selectors/get-media-item';

/**
 * Clear `isDirty` status of given media item. In classic post editor in Calypso we
 * track `isDirty` in case a post contains several representations of the same
 * media item and update them accordingly if the media item itself is edited.
 *
 * See state/media/thunks/edit-media.js:34
 *
 * @param {number} siteId site identifier
 * @param {number} mediaId media item identifier
 */
export const clearMediaItemDirtyStatus = ( siteId, mediaId ) => ( dispatch, getState ) => {
	/*
	 * @TODO: after the media library reduxification this should be a transformed
	 * to be a regular action, replacing the thunk.
	 */
	const mediaItem = getMediaItem( getState(), siteId, mediaId );
	const clearedItem = assign( {}, mediaItem, { isDirty: false } );

	dispatchFluxUpdateMediaItem( siteId, clearedItem );
};
