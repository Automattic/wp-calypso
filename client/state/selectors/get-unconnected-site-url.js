/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getUnconnectedSite } from 'state/selectors';

export default function getUnconnectedSiteUrl( state, siteId ) {
	const site = getUnconnectedSite( state, siteId );
	if ( ! site ) {
		return null;
	}

	return get( site, 'siteUrl', null );
}
