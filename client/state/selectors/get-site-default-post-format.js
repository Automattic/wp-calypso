/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteSettings } from 'state/site-settings/selectors';
import { getRawSite, getSiteOption } from 'state/sites/selectors';

/**
 * Returns the default post format of a site.
 * Returns null if the site is unknown and settings have not been fetched.
 *
 * @param  {Object}    state   Global state tree
 * @param  {Number}    siteId  The ID of the site we're querying
 * @return {?String}           The default post format of that site
 */
export default function getSiteDefaultPostFormat( state, siteId ) {
	const siteSettings = getSiteSettings( state, siteId );
	if ( ! siteSettings && ! getRawSite( state, siteId ) ) {
		return null;
	}

	let defaultPostFormat = get( siteSettings, 'default_post_format' );
	if ( ! defaultPostFormat ) {
		defaultPostFormat = getSiteOption( state, siteId, 'default_post_format' );
	}

	if ( ! defaultPostFormat || defaultPostFormat === '0' ) {
		defaultPostFormat = 'standard';
	}

	return defaultPostFormat;
}
