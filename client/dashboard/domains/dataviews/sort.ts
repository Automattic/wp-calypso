import type { SortDirection } from '@wordpress/dataviews';

/**
 * DataViews types a field's `sort` as receiving items, but at runtime it hands
 * the comparator the field's `getValue()` output. This adapts a comparator
 * written against those values to the type DataViews expects.
 */
export function fieldSort< T >(
	compare: ( a: T, b: T, direction: SortDirection ) => number
): ( a: unknown, b: unknown, direction: SortDirection ) => number {
	return compare as ( a: unknown, b: unknown, direction: SortDirection ) => number;
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
