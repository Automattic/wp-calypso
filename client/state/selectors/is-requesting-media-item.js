/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if the media is being requested for a specified site ID and media ID.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @param  {Object}  mediaId Media ID
 * @return {bool}            True if the media is being requested
 */
export default function isRequestingMediaItem( state, siteId, mediaId ) {
	return get( state.media.mediaItemRequests, [ siteId, mediaId ], false );
}
