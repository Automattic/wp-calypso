import { filterSortAndPaginate } from '@wordpress/dataviews';
import { EXPIRY_FIELD_ID, getExpiryBucket } from './expiry';
import type { DomainSummary } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

const expiryBucketField: Field< DomainSummary > = {
	id: 'expiry_bucket',
	getValue: ( { item } ) => getExpiryBucket( item ),
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
				filter.field === EXPIRY_FIELD_ID ? { ...filter, field: expiryBucketField.id } : filter
			),
		},
		[ ...fields, expiryBucketField ]
	);
}
