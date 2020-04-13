/**
 * External dependencies
 */
import { get } from 'lodash';
/**
 * Internal dependencies
 */
import { getGoogleApps, hasGoogleApps } from 'lib/cart-values/cart-items';
import { retrieveSignupDestination } from 'signup/utils';

/**
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @param {object} cart object
 * @returns {boolean} True if current user is able to see the checklist after checkout
 */
export default function isEligibleForSignupDestination( state, siteId, cart ) {
	if ( hasGoogleApps( cart ) ) {
		const domainReceiptId = get( getGoogleApps( cart ), '[0].extra.receipt_for_domain', 0 );

		if ( ! domainReceiptId ) {
			return false;
		}
	}

	return Boolean( retrieveSignupDestination() );
}
