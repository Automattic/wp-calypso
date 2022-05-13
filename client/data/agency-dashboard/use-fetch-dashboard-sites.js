import { useTranslate } from 'i18n-calypso';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { formatSites } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/utils';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { errorNotice } from 'calypso/state/notices/actions';

const useFetchDashboardSites = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	return useQuery(
		[ 'dashboard-sites' ],
		() =>
			wpcomJpl.req.get( {
				path: '/jetpack-partner/dashboard/sites-mock',
				apiNamespace: 'wpcom/v2',
			} ),
		{
			refetchOnWindowFocus: false,
			select: formatSites,
			onError: () =>
				dispatch(
					errorNotice( translate( 'Failed to retrieve your sites. Please try again later.' ) )
				),
		}
	);
};

export default useFetchDashboardSites;
