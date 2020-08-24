/**
 * External dependencies
 */
import { assign } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchFluxUpdateMediaItem } from 'state/media/utils/flux-adapter';
import { updateMediaItem } from 'state/media/actions';
import getMediaItem from 'state/selectors/get-media-item';

/**
 * Redux thunk to update a media item data.
 *
 * Note: Temporarily this action will dispatch to the flux store, until
 * the flux store is removed.
 *
 * @param {number} siteId site identifier
 * @param {object} item edited media item
 */
export const updateMedia = ( siteId, item ) => ( dispatch, getState ) => {
	const mediaId = item.ID;

	const originalMediaItem = getMediaItem( getState(), siteId, mediaId );
	const updatedMediaItem = assign( {}, originalMediaItem, item );

	dispatchFluxUpdateMediaItem( siteId, updatedMediaItem );

	dispatch( updateMediaItem( siteId, updatedMediaItem ) );
};
