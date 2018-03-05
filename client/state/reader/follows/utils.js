/** @format */
/**
 * Internal Dependencies
 */
import { untrailingslashit } from 'lib/route';

export function prepareComparableUrl( url ) {
	const unslashedUrl = url && untrailingslashit( url );
	if ( ! unslashedUrl ) {
		return null;
	}
	const preparedUrl = unslashedUrl.replace( /^https?:\/\//, '' ).toLowerCase();
	if ( preparedUrl === 'www' || preparedUrl === 'www.' ) {
		return null;
	}

	return preparedUrl;
}
