import { useQuery } from '@tanstack/react-query';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import wpcom, { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import type {
	AgencyDashboardFilter,
	DashboardSortInterface,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

const client = isA8CForAgencies() ? wpcom : wpcomJpl;

const agencyDashboardFilterToQueryObject = ( filter: AgencyDashboardFilter ) => {
	return {
		...filter?.issueTypes?.reduce(
			( previousValue, currentValue ) => ( {
				...previousValue,
				[ currentValue ]: true,
			} ),
			{}
		),
		...( filter.showOnlyFavorites && { show_only_favorites: true } ),
		...( filter.isNotMultisite && { not_multisite: true } ),
		...( filter?.showOnlyFavorites && { show_only_favorites: true } ),
		...( filter?.showOnlyDevelopmentSites && { show_only_dev_sites: true } ),
	};
};

const agencyDashboardSortToQueryObject = ( sort?: DashboardSortInterface ) => {
	if ( ! sort ) {
		return;
	}

	return {
		...( sort?.field && { sort_field: sort.field } ),
		...( sort?.direction && { sort_direction: sort.direction } ),
	};
};

export interface FetchDashboardSitesArgsInterface extends FetchSitesQueryKeyParams {
	isPartnerOAuthTokenLoaded: boolean;
}

export interface FetchSitesQueryKeyParams {
	searchQuery: string | undefined;
	currentPage: number;
	filter: AgencyDashboardFilter;
	sort?: DashboardSortInterface;
	perPage?: number;
	agencyId?: number;
}

/**
 * Query key generator to preserving the right order of the query key and to ensure the data type.
 * @param queryParams The query object to generate the key from
 */
export function getQueryKey( queryParams: FetchSitesQueryKeyParams ) {
	const { agencyId, searchQuery, currentPage, perPage, filter, sort } = queryParams;

	// Generate the key always in the same order
	return [
		'jetpack-agency-dashboard-sites',
		searchQuery,
		currentPage,
		filter,
		sort,
		perPage,
		...( agencyId ? [ agencyId ] : [] ),
	];
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
		searchQuery,
		currentPage,
		filter,
		sort,
		perPage,
		...( agencyId ? [ agencyId ] : [] ),
	];

	// If perPage is not provided, we want to remove perPage from the query_key as existing tests don't pass otherwise.
	if ( ! perPage ) {
		queryKey = [ searchQuery, currentPage, filter, sort, ...( agencyId ? [ agencyId ] : [] ) ];
	}

	const isAgencyOrPartnerAuthEnabled = isPartnerOAuthTokenLoaded || !! agencyId;

	return useQuery( {
		// Disable eslint rule since TS isn't grasping that agencyId is being optionally added to the array
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
		queryKey: [ 'jetpack-agency-dashboard-sites', hashParameters( queryKey ) ],
		queryFn: () =>
			client.req.get(
				{
					path: '/jetpack-agency/sites',
					apiNamespace: 'wpcom/v2',
				},
				{
					...( searchQuery ? { query: searchQuery } : {} ),
					...( currentPage ? { page: currentPage } : {} ),
					...agencyDashboardFilterToQueryObject( filter ),
					...agencyDashboardSortToQueryObject( sort ),
					per_page: perPage,
					...( agencyId ? { agency_id: agencyId } : {} ),
				}
			),
		select: ( data ) => {
			return {
				sites: data.sites,
				total: data.total,
				perPage: data.per_page,
				totalDevelopmentSites: data.total_dev_sites,
				totalFavorites: data.total_favorites,
			};
		},
		enabled: isAgencyOrPartnerAuthEnabled,
	} );
};

export default useFetchDashboardSites;
