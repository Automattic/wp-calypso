import { mayWeTrackByTracker, AdTracker } from '../tracker-buckets';
import { recordPlansViewInCriteo } from './criteo';

// Ensure setup has run.
import './setup';

/**
 * A generic function that we can export and call to track plans page views with our ad partners
 */
export function retargetViewPlans() {
	if ( mayWeTrackByTracker( AdTracker.CRITEO ) ) {
		recordPlansViewInCriteo();
	}
}
