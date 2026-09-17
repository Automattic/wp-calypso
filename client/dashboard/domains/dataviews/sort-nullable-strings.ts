import type { SortDirection } from '@wordpress/dataviews';

/**
 * Sort comparator for nullable string field values. Null/undefined values sort
 * to the end regardless of direction.
 */
export function sortNullableStrings( a: any, b: any, direction: SortDirection ) {
	if ( a == null && b == null ) {
		return 0;
	}
	if ( a == null ) {
		return 1;
	}
	if ( b == null ) {
		return -1;
	}

	const factor = direction === 'asc' ? 1 : -1;
	return String( a ).localeCompare( String( b ) ) * factor;
}
