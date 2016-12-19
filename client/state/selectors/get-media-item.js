/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns a media object by site ID, media ID, or null if not known
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @param  {Number}  mediaId Media ID
 * @return {?Object}         Media object, if known
 */
export default function getMediaItem( state, siteId, mediaId ) {
	return get( state.media.items, [ siteId, mediaId ], null );
}
