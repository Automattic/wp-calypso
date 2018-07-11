/** @format */

/**
 * External dependencies
 */
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteOption, isNewSite } from 'state/sites/selectors';
import { cartItems } from 'lib/cart-values';
import { isBusiness, isJetpackPlan } from 'lib/products-values';

/**
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Object} cart object
 * @return {Boolean} True if current user is able to see the checklist after checkout
 */
export default function isEligibleForCheckoutToChecklist( state, siteId, cart ) {
	const designType = getSiteOption( state, siteId, 'design_type' );

	if (
		cartItems.hasDomainMapping( cart ) ||
		cartItems.hasDomainRegistration( cart ) ||
		cartItems.hasTransferProduct( cart )
	) {
		return false;
	}

	return (
		'blog' === designType &&
		isNewSite( state, siteId ) &&
		cartItems.hasPlan( cart ) &&
		! some( cartItems.getAll( cart ), isDotcomBusinessPlan )
	);
}

function isDotcomBusinessPlan( product ) {
	return isBusiness( product ) && ! isJetpackPlan( product );
}
