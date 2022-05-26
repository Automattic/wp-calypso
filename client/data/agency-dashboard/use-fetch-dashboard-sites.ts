import { useTranslate } from 'i18n-calypso';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { errorNotice } from 'calypso/state/notices/actions';

const useFetchDashboardSites = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	return useQuery(
		[ 'jetpack-cloud', 'agency-dashboard', 'sites' ],
		() =>
			wpcomJpl.req.get( {
				path: '/jetpack-agency/sites',
				apiNamespace: 'wpcom/v2',
			} ),
		{
			select: ( data ) => ( data.sites ? Object.values( data.sites ) : [] ),
			refetchOnWindowFocus: false,
			onError: () =>
				dispatch(
					errorNotice( translate( 'Failed to retrieve your sites. Please try again later.' ) )
				),
		}
	);
};

export default useFetchDashboardSites;
