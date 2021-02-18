/**
 * External
 *
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteOption } from 'calypso/state/sites/selectors';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';

/**
 * Returns the default post format of a site.
 * Returns null if the site is unknown and settings have not been fetched.
 *
 * @param  {object}    state   Global state tree
 * @param  {number}    siteId  The ID of the site we're querying
 * @returns {?string}           The default post format of that site
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
