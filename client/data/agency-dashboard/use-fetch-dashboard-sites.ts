import { useTranslate } from 'i18n-calypso';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { errorNotice } from 'calypso/state/notices/actions';
import type { AgencyDashboardFilter } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

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

const useFetchDashboardSites = (
	isPartnerOAuthTokenLoaded: boolean,
	searchQuery: string,
	currentPage: number,
	filter: AgencyDashboardFilter
) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	return useQuery(
		[ 'jetpack-agency-dashboard-sites', searchQuery, currentPage, filter ],
		() =>
			wpcomJpl.req.get(
				{
					path: '/jetpack-agency/sites',
					apiNamespace: 'wpcom/v2',
				},
				{
					...( searchQuery && { query: searchQuery } ),
					...( currentPage && { page: currentPage } ),
					...agencyDashboardFilterToQueryObject( filter ),
				}
			),
		{
			select: ( data ) => {
				return {
					sites: data.sites,
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
		}
	);
};

export default useFetchDashboardSites;
