/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getRawSite } from 'state/sites/selectors';
import { getSiteSettings } from 'state/site-settings/selectors';

/**
 * Returns a ID to the media associated with a site's current site icon, or
 * null if not known or an icon is not assigned.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?Number}        Media ID of site icon, if known and exists
 */
export default function getSiteIconId( state, siteId ) {
	// Treat site object as preferred source of truth of media ID
	const site = getRawSite( state, siteId );
	if ( site ) {
		return get( site, 'icon.media_id', null );
	}

	// Fall back to site settings in case we know settings prior to having
	// received the site itself
	const settings = getSiteSettings( state, siteId );
	if ( settings ) {
		return settings.site_icon;
	}

	return null;
}
