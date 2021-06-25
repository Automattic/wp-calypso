/**
 * Internal dependencies
 */
import { isCriteoEnabled } from './constants';
import { recordViewCheckoutInCriteo } from './criteo';

// Ensure setup has run.
import './setup';

/**
 * Records that a user viewed the checkout page
 *
 * @param {object} cart - cart as `ResponseCart` object
 */
export function recordViewCheckout( cart ) {
	if ( isCriteoEnabled ) {
		recordViewCheckoutInCriteo( cart );
	}
}
