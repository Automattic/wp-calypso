/**
 * Internal dependencies
 */
import safeImageUrl from 'lib/safe-image-url';
import { getMediaItem } from './';

/**
 * Returns the URL for a media item, or null if not known
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @param  {Number}  mediaId Media ID
 * @return {?String}         Media URL, if known
 */
export default function getMediaUrl( state, siteId, mediaId ) {
	const media = getMediaItem( state, siteId, mediaId );
	if ( ! media ) {
		return null;
	}

	return safeImageUrl( media.URL );
}
