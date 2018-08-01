/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getUnconnectedSite from 'state/selectors/get-unconnected-site';

/**
 * Returns the URL of a particular Jetpack onboarding site.
 * Returns null if site is not known.
 *
 * @param  {Object}   state   Global state tree.
 * @param  {Integer}  siteId  Unconnected site ID.
 * @return {?String}          URL of the site.
 */
export default function getUnconnectedSiteUrl( state, siteId ) {
	const site = getUnconnectedSite( state, siteId );
	if ( ! site ) {
		return null;
	}

	return get( site, 'siteUrl', null );
}
