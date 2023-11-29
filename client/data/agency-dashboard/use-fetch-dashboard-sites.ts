import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
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

const useFetchDashboardSites = (
	isPartnerOAuthTokenLoaded: boolean,
	searchQuery: string,
	currentPage: number,
	filter: AgencyDashboardFilter,
	sort: DashboardSortInterface
) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const data = useQuery( {
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
				sites: data.sites,
				total: data.total,
				perPage: data.per_page,
				totalFavorites: data.total_favorites,
			};
		},
		enabled: isPartnerOAuthTokenLoaded,
	} );

	useEffect( () => {
		if ( data.isError ) {
			dispatch(
				errorNotice( translate( 'Failed to retrieve your sites. Please try again later.' ) )
			);
		}
	}, [ data.isError, dispatch, translate ] );

	return data;
};

export default useFetchDashboardSites;
