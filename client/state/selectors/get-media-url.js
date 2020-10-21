/**
 * Internal dependencies
 */

import safeImageUrl from 'calypso/lib/safe-image-url';
import getMediaItem from 'calypso/state/selectors/get-media-item';

/**
 * Returns the URL for a media item, or null if not known
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @param  {number}  mediaId Media ID
 * @returns {?string}         Media URL, if known
 */
export default function getMediaUrl( state, siteId, mediaId ) {
	const media = getMediaItem( state, siteId, mediaId );
	if ( ! media ) {
		return null;
	}

	return safeImageUrl( media.URL );
}
