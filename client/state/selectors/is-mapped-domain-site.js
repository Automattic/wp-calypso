/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getRawSite } from 'state/sites/selectors';

/**
 * Returns true if site is a mapped domain site, false if the site is not,
 * or null if the site is unknown.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {?Boolean} Whether site is a mapped domain site
 */
export default function isMappedDomainSite( state, siteId ) {
	const site = getRawSite( state, siteId );

	if ( ! site ) {
		return null;
	}

	return get( site, 'options.is_mapped_domain', false );
}
