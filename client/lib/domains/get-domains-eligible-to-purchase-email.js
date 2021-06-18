/**
 * Internal dependencies
 */
import { canCurrentUserAddEmail } from './can-current-user-add-email';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';

/**
 * Filters a list of domain objects by their eligibility to purchase email.
 *
 * - This excludes domains that already have email subscriptions and then checks if the rest can add email
 *
 * @param {Array} domains - list of domain objects
 * @returns {Array} - the resultant list of eligible domains objects
 */
export function getDomainsEligibleToPurchaseEmail( domains ) {
	return domains.filter( ( domain ) => {
		if ( hasGSuiteWithUs( domain ) || hasTitanMailWithUs( domain ) ) {
			return false;
		}

		return canCurrentUserAddEmail( domain );
	} );
}
