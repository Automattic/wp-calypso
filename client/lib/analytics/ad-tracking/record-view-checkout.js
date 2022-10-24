import { mayWeTrackByTracker, AdTracker } from '../tracker-buckets';
import { recordViewCheckoutInCriteo } from './criteo';

// Ensure setup has run.
import './setup';

/**
 * Records that a user viewed the checkout page
 *
 * @param {object} cart - cart as `ResponseCart` object
 */
export function recordViewCheckout( cart ) {
	if ( mayWeTrackByTracker( AdTracker.CRITEO ) ) {
		recordViewCheckoutInCriteo( cart );
	}
}
