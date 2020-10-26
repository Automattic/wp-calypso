/**
 * External dependencies
 */

import { get, some } from 'lodash';

/**
 * Internal dependencies
 */
import getRawSite from 'calypso/state/selectors/get-raw-site';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';

/**
 * Returns true if site is a mapped domain site, false if the site is not,
 * or null if the site is unknown.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {?boolean} Whether site is a mapped domain site
 */
export default function isMappedDomainSite( state, siteId ) {
	const site = getRawSite( state, siteId );
	const domains = getDomainsBySiteId( state, siteId );

	if ( ! site || 0 === domains.length ) {
		return null;
	}

	return (
		get( site, 'options.is_mapped_domain', false ) &&
		some( domains, ( { isWPCOMDomain } ) => ! isWPCOMDomain )
	);
}
