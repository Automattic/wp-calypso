/**
 * Internal dependencies
 */
import { updateMediaItem } from 'calypso/state/media/actions';
import getMediaItem from 'calypso/state/selectors/get-media-item';

/**
 * Redux thunk to update a media item data.
 *
 * @param {number} siteId site identifier
 * @param {object} item edited media item
 */
export const updateMedia = ( siteId, item ) => ( dispatch, getState ) => {
	const mediaId = item.ID;

	const originalMediaItem = getMediaItem( getState(), siteId, mediaId );
	const updatedMediaItem = { ...originalMediaItem, ...item };

	dispatch( updateMediaItem( siteId, updatedMediaItem, originalMediaItem ) );
};
