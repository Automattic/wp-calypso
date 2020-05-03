/**
 * Internal Dependencies
 */
import { untrailingslashit } from 'lib/route';

export function prepareComparableUrl( url ) {
	const preparedUrl = url && untrailingslashit( url );
	return preparedUrl && preparedUrl.replace( /^https?:\/\//, '' ).toLowerCase();
}
