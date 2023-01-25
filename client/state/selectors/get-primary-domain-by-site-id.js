import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';

/**
 * Return primary domain from state object and
 * the given site ID
 *
 * @param {Object} state - current state object
 * @param {?number} siteId - site ID
 * @returns {import('calypso/lib/domains/types').ResponseDomain|null|undefined} primary domain
 */
export default function getPrimaryDomainBySiteId( state, siteId ) {
	const domains = getDomainsBySiteId( state, siteId );
	if ( domains.length === 0 ) {
		return null;
	}

	return domains.filter( ( domain ) => domain.isPrimary )[ 0 ];
}
