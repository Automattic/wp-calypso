import { isAdTrackingAllowed } from 'calypso/lib/analytics/utils';
import { mayWeTrackByTracker, AdTracker } from '../tracker-buckets';
import { recordPlansViewInCriteo } from './criteo';

// Ensure setup has run.
import './setup';

/**
 * A generic function that we can export and call to track plans page views with our ad partners
 */
export function retargetViewPlans() {
	if ( ! isAdTrackingAllowed() ) {
		return;
	}

	if ( mayWeTrackByTracker( AdTracker.CRITEO ) ) {
		recordPlansViewInCriteo();
	}
}
