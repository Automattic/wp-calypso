/**
 * External dependencies
 */
import { get } from 'lodash';
/**
 * Internal dependencies
 */
import { getGoogleApps, hasGoogleApps } from 'calypso/lib/cart-values/cart-items';
import { retrieveSignupDestination } from 'calypso/signup/storageUtils';

/**
 * @param {object} cart object
 * @returns {boolean} True if current user is able to see the checklist after checkout
 */
export default function isEligibleForSignupDestination( cart ) {
	if ( hasGoogleApps( cart ) ) {
		const domainReceiptId = get( getGoogleApps( cart ), '[0].extra.receipt_for_domain', 0 );

		if ( ! domainReceiptId ) {
			return false;
		}
	}

	return Boolean( retrieveSignupDestination() );
}
