/** @format */
/**
 * Internal Dependencies
 */
import { untrailingslashit } from 'lib/route';
import { resemblesUrl } from 'lib/url';

export function prepareComparableUrl( url ) {
	const unslashedUrl = url && untrailingslashit( url );
	if ( ! unslashedUrl ) {
		return null;
	}

	// Check that the basic URL format appears valid
	if ( ! resemblesUrl( unslashedUrl ) ) {
		return null;
	}

	const preparedUrl = unslashedUrl.replace( /^https?:\/\//, '' ).toLowerCase();

	return preparedUrl;
}
