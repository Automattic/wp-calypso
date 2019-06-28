/** @format */
/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { isNewSite } from 'state/sites/selectors';
import {
	getAllCartItems,
	hasDomainMapping,
	hasDomainRegistration,
	hasTransferProduct,
	hasPlan,
	hasConciergeSession,
} from 'lib/cart-values/cart-items';
import isEligibleForDotcomChecklist from './is-eligible-for-dotcom-checklist';
import { retrieveSignupDestination } from 'signup/utils';

/**
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Object} cart object
 * @param {String} destination The final destination URL after signup completes
 * @return {Boolean} True if current user is able to see the checklist after checkout
 */
export default function isEligibleForSignupDestination( state, siteId, cart ) {
	if ( ! isEmpty( getAllCartItems( cart ) ) ) {
		if (
			hasDomainMapping( cart ) ||
			hasDomainRegistration( cart ) ||
			hasTransferProduct( cart ) ||
			( ! hasPlan( cart ) && ! hasConciergeSession( cart ) ) ||
			hasEcommercePlan( cart )
		) {
			return false;
		}
	}

	const destination = retrieveSignupDestination();
	if ( destination && destination.includes( '/checklist/' ) ) {
		return isNewSite( state, siteId ) && isEligibleForDotcomChecklist( state, siteId );
	}

	return isNewSite( state, siteId );
}
