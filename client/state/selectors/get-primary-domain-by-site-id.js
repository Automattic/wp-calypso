import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';

/**
 * Return primary domain from state object and
 * the given site ID
 *
 * @param {object} state - current state object
 * @param {?number} siteId - site ID
 * @returns {object} primary domain
 */
export default function getPrimaryDomainBySiteId( state, siteId ) {
	const domains = getDomainsBySiteId( state, siteId );
	if ( domains.length === 0 ) {
		return null;
	}

	return domains.filter( ( domain ) => domain.isPrimary )[ 0 ];
}
