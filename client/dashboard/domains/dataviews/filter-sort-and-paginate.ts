import { filterSortAndPaginate } from '@wordpress/dataviews';
import { EXPIRY_FIELD_ID, getExpiryBucket } from './expiry';
import type { DomainSummary } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

/**
 * DataViews derives both filtering and sorting from a single `getValue()`, so the
 * expiry field cannot return dates for sorting and expiry buckets for filtering at
 * the same time. It returns dates, and the bucket filter is applied here instead —
 * before DataViews paginates, so it stays consistent with the row counts.
 */
export function filterSortAndPaginateDomains(
	domains: DomainSummary[],
	view: View,
	fields: Field< DomainSummary >[]
) {
	const expiryFilters =
		view.filters?.filter(
			( { field, operator } ) => field === EXPIRY_FIELD_ID && operator === 'isAny'
		) ?? [];

	if ( expiryFilters.length === 0 ) {
		return filterSortAndPaginate( domains, view, fields );
	}

	const matchesExpiryFilters = ( domain: DomainSummary ) => {
		const bucket = getExpiryBucket( domain );
		return bucket !== null && expiryFilters.every( ( { value } ) => value?.includes?.( bucket ) );
	};

	return filterSortAndPaginate(
		domains.filter( matchesExpiryFilters ),
		{ ...view, filters: view.filters?.filter( ( filter ) => ! expiryFilters.includes( filter ) ) },
		fields
	);
}
