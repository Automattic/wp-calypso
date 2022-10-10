import { useTranslate } from 'i18n-calypso';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { errorNotice } from 'calypso/state/notices/actions';

const useFetchTestConnection = ( isPartnerOAuthTokenLoaded: boolean, siteId: number ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	return useQuery(
		[ 'jetpack-agency-test-connection', siteId ],
		() =>
			wpcomJpl.req.get(
				{
					path: `/jetpack-blogs/${ siteId }/test-connection`,
					apiNamespace: 'rest/v1.1',
				},
				{
					is_stale_connection_healthy: 1,
				}
			),
		{
			onError: () =>
				dispatch(
					errorNotice(
						translate( 'Failed to check your sites connection. Please try again later.' )
					)
				),
			enabled: isPartnerOAuthTokenLoaded,
		}
	);
};

export default useFetchTestConnection;
