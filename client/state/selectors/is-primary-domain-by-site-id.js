import { get } from 'lodash';
/**
 * Internal dependencies
 */

import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';

/**
 * Return if it's the primary domainfrom state object and
 * the given site ID and domain.
 *
 * @param {object} state - current state object
 * @param {object} siteId - site object
 * @param {string} domain - domian name
 * @returns {object} primary domain
 */
export default function isPrimaryDomainBySiteId( state, siteId, domain ) {
	return domain === get( getPrimaryDomainBySiteId( state, siteId ), 'domain' );
}
