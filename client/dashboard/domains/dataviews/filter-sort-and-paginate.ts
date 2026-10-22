import { filterSortAndPaginate } from '@wordpress/dataviews';
import type { DomainSummary } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const expiryBucketField: Field< DomainSummary > = {
	id: 'expiry_bucket',
	getValue: ( { item } ) => {
		if ( ! item.expiry ) {
			return null;
		}
		if ( item.expired ) {
			return '1-expired';
		}
		const days = Math.ceil( ( new Date( item.expiry ).getTime() - Date.now() ) / DAY_IN_MS );
		return days <= 90 ? '2-next-90-days' : '3-more-than-90-days';
	},
};

/**
 * DataViews derives both filtering and sorting from a single `getValue()`, so the
 * expiry field returns dates for sorting and its filter is redirected to a bucket field.
 */
export function filterSortAndPaginateDomains(
	domains: DomainSummary[],
	view: View,
	fields: Field< DomainSummary >[]
) {
	return filterSortAndPaginate(
		domains,
		{
			...view,
			filters: view.filters?.map( ( filter ) =>
				filter.field === 'expiry' ? { ...filter, field: expiryBucketField.id } : filter
			),
		},
		[ ...fields, expiryBucketField ]
	);
}
