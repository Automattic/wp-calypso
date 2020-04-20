/**
 * Internal dependencies
 */

import { getDomainsBySiteId } from 'state/sites/domains/selectors';

/**
 * Return primary domain from state object and
 * the given site ID
 *
 * @param {object} state - current state object
 * @param {object} siteId - site object
 * @returns {object} primary domain
 */
export default function getPrimaryDomainBySiteId( state, siteId ) {
	const domains = getDomainsBySiteId( state, siteId );
	if ( domains.length === 0 ) {
		return null;
	}

	return domains.filter( ( domain ) => domain.isPrimary )[ 0 ];
}
