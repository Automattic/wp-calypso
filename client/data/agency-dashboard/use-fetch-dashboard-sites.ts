import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import wpcom, { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import type {
	AgencyDashboardFilter,
	DashboardSortInterface,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

const client = isEnabled( 'a8c-for-agencies' ) ? wpcom : wpcomJpl;

const agencyDashboardFilterToQueryObject = ( filter: AgencyDashboardFilter ) => {
	return {
		...filter.issueTypes?.reduce(
			( previousValue, currentValue ) => ( {
				...previousValue,
				[ currentValue ]: true,
			} ),
			{}
		),
		...( filter.showOnlyFavorites && { show_only_favorites: true } ),
	};
};

const agencyDashboardSortToQueryObject = ( sort: DashboardSortInterface ) => {
	return {
		...( sort.field && { sort_field: sort.field } ),
		...( sort.direction && { sort_direction: sort.direction } ),
	};
};

interface FetchDashboardSitesArgsInterface {
	isPartnerOAuthTokenLoaded: boolean;
	searchQuery: string;
	currentPage: number;
	filter: AgencyDashboardFilter;
	sort: DashboardSortInterface;
	perPage?: number;
	agencyId?: number;
}

const useFetchDashboardSites = ( {
	isPartnerOAuthTokenLoaded,
	searchQuery,
	currentPage,
	filter,
	sort,
	perPage,
	agencyId,
}: FetchDashboardSitesArgsInterface ) => {
	let queryKey = [
		'jetpack-agency-dashboard-sites',
		searchQuery,
		currentPage,
		filter,
		sort,
		perPage,
		...( agencyId ? [ agencyId ] : [] ),
	];

	const esHitsRef = useRef< number >( 0 );
	const esHitsPageRef = useRef< number >( 0 );

	// If perPage is not provided, we want to remove perPage from the query_key as existing tests don't pass otherwise.
	if ( ! perPage ) {
		queryKey = [
			'jetpack-agency-dashboard-sites',
			searchQuery,
			currentPage,
			filter,
			sort,
			...( agencyId ? [ agencyId ] : [] ),
		];
	}

	const isAgencyOrPartnerAuthEnabled =
		isPartnerOAuthTokenLoaded || ( agencyId !== undefined && agencyId !== null );

	return useQuery( {
		// Disable eslint rule since TS isn't grasping that agencyId is being optionally added to the array
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
		queryKey,
		queryFn: () =>
			client.req.get(
				{
					path: '/jetpack-agency/sites',
					apiNamespace: 'wpcom/v2',
				},
				{
					...( searchQuery && { query: searchQuery } ),
					...( currentPage && { page: currentPage } ),
					...agencyDashboardFilterToQueryObject( filter ),
					...agencyDashboardSortToQueryObject( sort ),
					per_page: perPage,
					...( agencyId && { agency_id: agencyId } ),
					...( esHitsRef.current && { es_hits: esHitsRef.current } ),
					...( esHitsPageRef.current && { es_hits_page: esHitsPageRef.current } ),
				}
			),
		select: ( data ) => {
			esHitsRef.current = data.es_hits ?? 0;
			// Pagination starts with 1
			esHitsPageRef.current = data.es_hits_page ?? 1;

			return {
				sites: data.sites,
				total: data.total,
				perPage: data.per_page,
				totalFavorites: data.total_favorites,
			};
		},
		enabled: isAgencyOrPartnerAuthEnabled,
	} );
};

export default useFetchDashboardSites;
