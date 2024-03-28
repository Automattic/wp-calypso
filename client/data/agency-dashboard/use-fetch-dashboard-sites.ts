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
	agencyId?: number;
}

const useFetchDashboardSites = ( args: FetchDashboardSitesArgsInterface ) => {
	const {
		isPartnerOAuthTokenLoaded,
		searchQuery,
		currentPage,
		filter,
		sort,
		perPage = 20,
		agencyId,
	} = args;

	const queryKey = [
		'jetpack-agency-dashboard-sites',
		searchQuery,
		currentPage,
		filter,
		sort,
		perPage,
		...( agencyId ? [ agencyId ] : [] ),
	];

	const isAgencyOrPartnerAuthEnabled =
		isPartnerOAuthTokenLoaded || ( agencyId !== undefined && agencyId !== null );

	return useQuery( {
		// Disable eslint rule since TS isn't grasping that agencyId is being optionally added to the array
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
		queryKey,
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
					per_page: perPage,
					...( agencyId && { agency_id: agencyId } ),
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
		enabled: isAgencyOrPartnerAuthEnabled,
	} );
};

export default useFetchDashboardSites;
