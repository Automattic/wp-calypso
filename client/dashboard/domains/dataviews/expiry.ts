import type { DomainSummary } from '@automattic/api-core';
import type { Field, SortDirection } from '@wordpress/dataviews';

export const EXPIRY_FIELD_ID = 'expiry';

export type ExpiryBucket = '1-expired' | '2-next-90-days' | '3-more-than-90-days';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function getExpiryBucket( domain: DomainSummary ): ExpiryBucket | null {
	if ( ! domain.expiry ) {
		return null;
	}

	if ( domain.expired ) {
		return '1-expired';
	}

	const daysUntilExpiry = Math.ceil(
		( new Date( domain.expiry ).getTime() - Date.now() ) / MS_PER_DAY
	);

	return daysUntilExpiry <= 90 ? '2-next-90-days' : '3-more-than-90-days';
}

function compareNullableDates( a: string | null, b: string | null, direction: SortDirection ) {
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

// DataViews types a field's `sort` as receiving items, but at runtime it passes
// the output of `getValue()`.
export const sortNullableDates = compareNullableDates as unknown as NonNullable<
	Field< DomainSummary >[ 'sort' ]
>;
