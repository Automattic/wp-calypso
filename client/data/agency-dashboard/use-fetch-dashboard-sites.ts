import { useQuery } from '@tanstack/react-query';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import type {
	AgencyDashboardFilter,
	DashboardSortInterface,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

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
}

const useFetchDashboardSites = ( args: FetchDashboardSitesArgsInterface ) => {
	const { isPartnerOAuthTokenLoaded, searchQuery, currentPage, filter, sort, perPage } = args;
	let query_key = [
		'jetpack-agency-dashboard-sites',
		searchQuery,
		currentPage,
		filter,
		sort,
		perPage,
	];
	// If per_page is not provided, we want to remove per_page from the query_key as existing tests don't pass otherwise.
	if ( ! perPage ) {
		query_key = [ 'jetpack-agency-dashboard-sites', searchQuery, currentPage, filter, sort ];
	}

	return useQuery( {
		queryKey: query_key,
		queryFn: () =>
			wpcomJpl.req.get(
				{
					path: '/jetpack-agency/sites',
					apiNamespace: 'wpcom/v2',
				},
				{
					...( searchQuery && { query: searchQuery } ),
					...( currentPage && { page: currentPage } ),
					...agencyDashboardFilterToQueryObject( filter ),
					...agencyDashboardSortToQueryObject( sort ),
					per_page: perPage ?? 20,
				}
			),
		select: ( data ) => {
			return {
				sites: data.sites,
				total: data.total,
				perPage: data.per_page,
				totalFavorites: data.total_favorites,
			};
		},
		enabled: isPartnerOAuthTokenLoaded,
	} );
};

export default useFetchDashboardSites;
