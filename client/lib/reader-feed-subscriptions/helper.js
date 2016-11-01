/**
 * External Dependencies
 */


/**
 * Internal Dependencies
 */
import untrailingslashit from 'lib/route/untrailingslashit';

// Prepare site URL for use with the FeedSubscriptionStore
export function prepareSiteUrl( url ) {
	// remove trailing /
	return url && untrailingslashit( url );
}
