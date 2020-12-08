/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Returns true if site is a Domain-only site, false if the site is a regular site,
 * or null if the site is unknown.
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?boolean}        Whether site is a Domain-only site
 */
export default function isDomainOnlySite( state, siteId ) {
	const site = getRawSite( state, siteId );

	if ( ! site ) {
		return null;
	}

	return get( site, 'options.is_domain_only', false );
}
