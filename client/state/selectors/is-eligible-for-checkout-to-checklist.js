/** @format */

/**
 * Internal dependencies
 */
import { isNewSite } from 'state/sites/selectors';
import {
	hasDomainMapping,
	hasDomainRegistration,
	hasTransferProduct,
	hasPlan,
	hasConciergeSession,
	hasEcommercePlan,
} from 'lib/cart-values/cart-items';
import isEligibleForDotcomChecklist from './is-eligible-for-dotcom-checklist';

/**
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Object} cart object
 * @return {Boolean} True if current user is able to see the checklist after checkout
 */
export default function isEligibleForCheckoutToChecklist( state, siteId, cart ) {
	if (
		hasDomainMapping( cart ) ||
		hasDomainRegistration( cart ) ||
		hasTransferProduct( cart ) ||
		( ! hasPlan( cart ) && ! hasConciergeSession( cart ) ) ||
		hasEcommercePlan( cart )
	) {
		return false;
	}

	return isNewSite( state, siteId ) && isEligibleForDotcomChecklist( state, siteId );
}
