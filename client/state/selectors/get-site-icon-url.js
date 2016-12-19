/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getRawSite } from 'state/sites/selectors';
import { getSiteIconId, getMediaUrl } from './';

/**
 * Returns a URL to the site's current site icon, or null if no icon exists or
 * if site is not known
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?String}        URL of site icon, if known and exists
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
