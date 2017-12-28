/** @format */
/**
 * Internal Dependencies
 */
import untrailingslashit from 'client/lib/route/untrailingslashit';

export function prepareComparableUrl( url ) {
	const preparedUrl = url && untrailingslashit( url );
	return preparedUrl && preparedUrl.replace( /^https?:\/\//, '' ).toLowerCase();
}
