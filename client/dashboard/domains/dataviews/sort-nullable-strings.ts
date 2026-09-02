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

/**
 * Sort comparator for nullable ISO date string values. Null/undefined values
 * sort to the end regardless of direction.
 */
export function sortNullableDates(
	a: string | null | undefined,
	b: string | null | undefined,
	direction: SortDirection
) {
	if ( ! a && ! b ) {
		return 0;
	}
	if ( ! a ) {
		return 1;
	}
	if ( ! b ) {
		return -1;
	}

	const factor = direction === 'asc' ? 1 : -1;
	return ( new Date( a ).getTime() - new Date( b ).getTime() ) * factor;
}
