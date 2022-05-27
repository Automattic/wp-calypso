import { useTranslate } from 'i18n-calypso';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { errorNotice } from 'calypso/state/notices/actions';

const useFetchDashboardSites = ( searchQuery: string | null, currentPage: number | null ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	return useQuery(
		[ 'jetpack-cloud', 'agency-dashboard', 'sites', searchQuery, currentPage ],
		() =>
			wpcomJpl.req.get(
				{
					path: '/jetpack-agency/sites',
					apiNamespace: 'wpcom/v2',
				},
				{
					...( searchQuery && { query: searchQuery } ),
					...( currentPage && { page: currentPage } ),
				}
			),
		{
			select: ( data ) => {
				return {
					sites: data.sites ? Object.values( data.sites ) : [],
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
