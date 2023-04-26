import { get } from 'lodash';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';

/**
 * Return if it's the primary domainfrom state object and
 * the given site ID and domain.
 *
 * @param {Object} state - current state object
 * @param {?number} siteId - site ID
 * @param {string} domain - domian name
 * @returns {boolean} primary domain
 */
export default function isPrimaryDomainBySiteId( state, siteId, domain ) {
	return domain === get( getPrimaryDomainBySiteId( state, siteId ), 'domain' );
}
