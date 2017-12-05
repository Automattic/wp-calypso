/** @format */

/**
 * External dependencies
 */
import { get, some } from 'lodash';

/**
 * Internal dependencies
 */
import { getSite } from 'state/sites/selectors';
import { cartItems } from 'lib/cart-values';
import { isBusiness, isJetpackPlan } from 'lib/products-values';
import config from 'config';

/**
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Object} cart object
 * @return {Boolean} True if current user is able to see the checklist after checkout
 */
export default function isEligibleForCheckoutToChecklist( state, siteId, cart ) {
	const site = getSite( state, siteId );
	const designType = get( site, 'options.design_type' );
	const createdAt = get( site, 'options.created_at' );
	const isNewSite = createdAt && Date.now() - Date.parse( createdAt ) < 30 * 60000; // within 30 mins

	if ( ! config.isEnabled( 'onboarding-checklist' ) ) {
		return false;
	}

	return (
		isNewSite &&
		'blog' === designType &&
		cartItems.hasPlan( cart ) &&
		! some( cartItems.getAll( cart ), isDotcomBusinessPlan )
	);
}

function isDotcomBusinessPlan( product ) {
	return isBusiness( product ) && ! isJetpackPlan( product );
}
