/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import debug from './debug';
import isUrlExcludedForPerformance from './is-url-excluded-for-performance';
import isPiiUrl from './is-pii-url';
import mayWeTrackCurrentUserGdpr from './may-we-track-current-user-gdpr';
import { getDoNotTrack } from '@automattic/calypso-analytics';
/**
 * Returns whether ad tracking is allowed.
 *
 * This function returns false if:
 *
 * 1. 'ad-tracking' is disabled
 * 2. `Do Not Track` is enabled
 * 3. the current user could be in the GDPR zone and hasn't consented to tracking
 * 4. `document.location.href` may contain personally identifiable information
 *
 * @returns {boolean} Is ad tracking is allowed?
 */
export default function isAdTrackingAllowed() {
	const result =
		config.isEnabled( 'ad-tracking' ) &&
		! getDoNotTrack() &&
		! isUrlExcludedForPerformance() &&
		! isPiiUrl() &&
		mayWeTrackCurrentUserGdpr();
	debug( `isAdTrackingAllowed: ${ result }` );
	return result;
}
