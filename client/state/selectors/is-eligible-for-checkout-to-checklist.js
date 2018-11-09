/** @format */

/**
 * Internal dependencies
 */
import { isNewSite } from 'state/sites/selectors';
import { cartItems } from 'lib/cart-values';
import isEligibleForDotcomChecklist from './is-eligible-for-dotcom-checklist';

/**
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Object} cart object
 * @return {Boolean} True if current user is able to see the checklist after checkout
 */
export default function isEligibleForCheckoutToChecklist( state, siteId, cart ) {
	if (
		cartItems.hasDomainMapping( cart ) ||
		cartItems.hasDomainRegistration( cart ) ||
		cartItems.hasTransferProduct( cart ) ||
		! cartItems.hasPlan( cart )
	) {
		return false;
	}

	return isNewSite( state, siteId ) && isEligibleForDotcomChecklist( state, siteId );
}
