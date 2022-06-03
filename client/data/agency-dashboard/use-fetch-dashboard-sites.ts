import { useTranslate } from 'i18n-calypso';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { errorNotice } from 'calypso/state/notices/actions';
import type { AgencyDashboardFilter } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

const agencyDashboardFilterToQueryObject = ( filter: AgencyDashboardFilter ) =>
	filter.issueTypes?.reduce(
		( previousValue, currentValue ) => ( {
			...previousValue,
			[ currentValue ]: true,
		} ),
		{}
	);

const useFetchDashboardSites = (
	searchQuery: string,
	currentPage: number,
	filter: AgencyDashboardFilter,
	jetpackSiteDisconnected: boolean
) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	return useQuery(
		[
			'jetpack-cloud',
			'agency-dashboard',
			'sites',
			searchQuery,
			currentPage,
			filter,
			jetpackSiteDisconnected,
		],
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
				};
			},
			refetchOnWindowFocus: false,
			onError: () =>
				dispatch(
					errorNotice( translate( 'Failed to retrieve your sites. Please try again later.' ) )
				),
		}
	);
};

export default useFetchDashboardSites;
