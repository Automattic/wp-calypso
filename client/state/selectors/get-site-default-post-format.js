/**
 * Internal dependencies
 */
import { getRawSite, getSiteOption } from 'state/sites/selectors';

/**
 * Returns the default post format of a site.
 * Returns null if the site is unknown.
 *
 * @param  {Object}    state   Global state tree
 * @param  {Number}    siteId  The ID of the site we're querying
 * @return {?String}           The default post format of that site
 */
export default function getSiteDefaultPostFormat( state, siteId ) {
	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return null;
	}

	let defaultPostFormat = getSiteOption( state, siteId, 'default_post_format' );
	if ( ! defaultPostFormat || defaultPostFormat === '0' ) {
		defaultPostFormat = 'standard';
	}

	return defaultPostFormat;
}
