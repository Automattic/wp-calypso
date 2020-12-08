/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getMediaStorage } from 'calypso/state/sites/media-storage/selectors';

/**
 * Returns a site's maximum storage in bytes or null if the site doesn't exist or the limit
 * is unknown.
 *
 * Note that the API will return -1 to indicate unlimited storage.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {?number}        Storage limit in bytes
 */
export default function getMediaStorageLimit( state, siteId ) {
	return get( getMediaStorage( state, siteId ), 'max_storage_bytes', null );
}
