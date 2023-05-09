import { mayWeTrackByTracker } from '../tracker-buckets';
import { recordViewCheckoutInCriteo } from './criteo';

// Ensure setup has run.
import './setup';

/**
 * Records that a user viewed the checkout page
 *
 * @param {Object} cart - cart as `ResponseCart` object
 */
export function recordViewCheckout( cart ) {
	if ( mayWeTrackByTracker( 'criteo' ) ) {
		recordViewCheckoutInCriteo( cart );
	}
}
