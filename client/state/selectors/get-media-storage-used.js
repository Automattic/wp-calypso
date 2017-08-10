/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getMediaStorage } from 'state/sites/media-storage/selectors';

/**
 * Returns a site's used storage in bytes or null if the site doesn't exist or the usage
 * is unknown.
 *
 * Note that the API may return -1 in some cases rather than reporting usage.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?Number}        Storage used in bytes
 */
export default function getMediaStorageUsed( state, siteId ) {
	return get( getMediaStorage( state, siteId ), 'storage_used_bytes', null );
}
