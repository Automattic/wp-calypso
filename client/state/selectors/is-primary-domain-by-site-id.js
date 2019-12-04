import { get } from 'lodash';
/**
 * Internal dependencies
 */

import getPrimaryDomainBySiteId from 'state/selectors/get-primary-domain-by-site-id';

/**
 * Return if it's the primary domainfrom state object and
 * the given site ID and domain.
 *
 * @param {Object} state - current state object
 * @param {Object} siteId - site object
 * @param {string} domain - domian name
 * @return {Object} primary domain
 */
export default function isPrimaryDomainBySiteId( state, siteId, domain ) {
	return domain === get( getPrimaryDomainBySiteId( state, siteId ), 'domain' );
}
