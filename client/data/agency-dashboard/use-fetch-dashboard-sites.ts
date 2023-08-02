import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import type {
	AgencyDashboardFilter,
	DashboardSortInterface,
	Site,
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

const useFetchDashboardSites = (
	isPartnerOAuthTokenLoaded: boolean,
	searchQuery: string,
	currentPage: number,
	filter: AgencyDashboardFilter,
	sort: DashboardSortInterface
) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	return useQuery( {
		queryKey: [ 'jetpack-agency-dashboard-sites', searchQuery, currentPage, filter, sort ],
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
				}
			),
		select: ( data ) => {
			return {
				sites: data.sites.map( ( site: Site ) => {
					// Since the "sites" API includes the "is_connected" property in the cache of the query set by
					// the "useFetchTestConnection" hook, we are setting it here again since the "sites" API gets called
					// more often than the "/test-connection" API which will flush the cache set by the
					// "useFetchTestConnection" hook
					const data: { connected: boolean } | undefined = queryClient.getQueryData( [
						'jetpack-agency-test-connection',
						site.blog_id,
					] );
					return {
						...site,
						is_connected: data?.hasOwnProperty( 'connected' ) ? data.connected : true,
					};
				} ),
				total: data.total,
				perPage: data.per_page,
				totalFavorites: data.total_favorites,
			};
		},
		onError: () =>
			dispatch(
				errorNotice( translate( 'Failed to retrieve your sites. Please try again later.' ) )
			),
		enabled: isPartnerOAuthTokenLoaded,
	} );
};

export default useFetchDashboardSites;
