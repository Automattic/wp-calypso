/**
 * Internal Dependencies
 */
import { untrailingslashit } from 'calypso/lib/route';

export function prepareComparableUrl( url ) {
	const preparedUrl = url && untrailingslashit( url );
	return preparedUrl && preparedUrl.replace( /^https?:\/\//, '' ).toLowerCase();
}
