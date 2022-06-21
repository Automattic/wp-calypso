import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import 'calypso/state/email-forwarding/init';

/**
 * Retrieve a list domains that have forwards
 *
 * @param  {object} state   Global state tree
 * @param  {Array} domains domains to filter
 * @returns {Array}          list of domains with forwards
 */
export function getDomainsWithForwards( state, domains ) {
	if ( ! domains || ! domains.length ) {
		return [];
	}
	return domains.filter( hasEmailForwards ).map( ( { domain } ) => domain );
}
