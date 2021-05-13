/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getRawSite from 'calypso/state/selectors/get-raw-site';
import getMediaUrl from 'calypso/state/selectors/get-media-url';
import getSiteIconId from 'calypso/state/selectors/get-site-icon-id';

/**
 * Returns a URL to the site's current site icon, or null if no icon exists or
 * if site is not known
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {?string}        URL of site icon, if known and exists
 */
export default function getSiteIconUrl( state, siteId ) {
	const iconId = getSiteIconId( state, siteId );
	const url = getMediaUrl( state, siteId, iconId );
	if ( url ) {
		return url;
	}

	// If cannot find media by ID, use icon.img property if available,
	// otherwise assume icon is not set
	return get( getRawSite( state, siteId ), 'icon.img', null );
}
