/**
 * Internal Dependencies
 */
import untrailingslashit from 'lib/route/untrailingslashit';

// Prepare site URL for use with the FeedSubscriptionStore
export function prepareSiteUrl( url ) {
	// remove trailing /
	return url && untrailingslashit( url );
}

export function prepareComparableUrl( url ) {
	const preparedUrl = prepareSiteUrl( url );
	return preparedUrl && preparedUrl.replace( /^https?:\/\//, '' ).toLowerCase();
}
