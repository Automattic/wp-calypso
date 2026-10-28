import { DomainSubtype } from '@automattic/api-core';
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
 * Position of a domain in the site's domains list, regardless of the view's sort: the free
 * WordPress.com address always comes first, the primary site address second, then the rest.
 */
export function getSiteDomainPinnedRank( domain: DomainSummary ): number {
	if ( domain.subtype.id === DomainSubtype.DEFAULT_ADDRESS ) {
		return 0;
	}
	if ( domain.primary_domain ) {
		return 1;
	}
	return 2;
}

/**
 * DataViews derives both filtering and sorting from a single `getValue()`, so the
 * expiry field returns dates for sorting and its filter is redirected to a bucket field.
 *
 * When `getPinnedRank` is given, items with a lower rank are moved to the top of the sorted
 * results (keeping the view's sort within each rank) before paginating.
 */
export function filterSortAndPaginateDomains(
	domains: DomainSummary[],
	view: View,
	fields: Field< DomainSummary >[],
	{ getPinnedRank }: { getPinnedRank?: ( domain: DomainSummary ) => number } = {}
) {
	const domainsView = {
		...view,
		filters: view.filters?.map( ( filter ) =>
			filter.field === 'expiry' ? { ...filter, field: expiryBucketField.id } : filter
		),
	};
	const domainsFields = [ ...fields, expiryBucketField ];

	if ( ! getPinnedRank ) {
		return filterSortAndPaginate( domains, domainsView, domainsFields );
	}

	const { data: sortedDomains } = filterSortAndPaginate(
		domains,
		{ ...domainsView, page: undefined, perPage: undefined },
		domainsFields
	);
	// `Array.prototype.sort` is stable, so the view's sort is kept within each rank.
	const pinnedDomains = [ ...sortedDomains ].sort(
		( a, b ) => getPinnedRank( a ) - getPinnedRank( b )
	);

	if ( view.page === undefined || view.perPage === undefined ) {
		return {
			data: pinnedDomains,
			paginationInfo: { totalItems: pinnedDomains.length, totalPages: 1 },
		};
	}

	const start = ( view.page - 1 ) * view.perPage;
	return {
		data: pinnedDomains.slice( start, start + view.perPage ),
		paginationInfo: {
			totalItems: pinnedDomains.length,
			totalPages: Math.ceil( pinnedDomains.length / view.perPage ),
		},
	};
}
