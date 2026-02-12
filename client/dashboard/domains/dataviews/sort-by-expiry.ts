import type { SortDirection } from '@wordpress/dataviews';

/**
 * Sort comparator for the expiry field.
 *
 * Note: Despite the Field<Item> type declaring sort as (a: Item, b: Item, ...),
 * the dataviews library's normalizeFields wraps it and actually passes getValue
 * results (category strings like '1-expired', '2-next-90-days', etc.) at runtime.
 * We use `any` to bridge this type mismatch.
 */
export function sortByExpiry( a: any, b: any, direction: SortDirection ) {
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
