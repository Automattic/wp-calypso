/**
 * Internal dependencies
 */
import { createTransientMedia } from 'calypso/lib/media/utils';
import { editMediaItem } from 'calypso/state/media/actions';
import getMediaItem from 'calypso/state/selectors/get-media-item';

/**
 * Redux thunk to edit a media item.
 *
 * @param {number} siteId site identifier
 * @param {object} item edited media item
 */
export const editMedia = ( siteId, item ) => ( dispatch, getState ) => {
	const transientMediaItem = createTransientMedia( item.media || item.media_url );

	if ( ! transientMediaItem ) {
		return;
	}

	const mediaId = item.ID;
	const originalMediaItem = getMediaItem( getState(), siteId, mediaId );
	const editedMediaItem = {
		...originalMediaItem,
		...transientMediaItem,
		ID: mediaId,
		isDirty: true,
	};

	dispatch( editMediaItem( siteId, editedMediaItem, item, originalMediaItem ) );
};
