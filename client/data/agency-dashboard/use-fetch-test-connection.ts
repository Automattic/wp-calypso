import { useTranslate } from 'i18n-calypso';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { errorNotice } from 'calypso/state/notices/actions';

const useFetchTestConnection = (
	isPartnerOAuthTokenLoaded: boolean,
	isConnectionHealthy: boolean,
	siteId: number
) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	return useQuery(
		[ 'jetpack-agency-test-connection', siteId ],
		() =>
			wpcom.req.get(
				{
					path: `/jetpack-blogs/${ siteId }/test-connection`,
					apiNamespace: 'rest/v1.1',
				},
				{
					// We call the current health state "stale", as it might be different than the actual state.
					is_stale_connection_healthy: Boolean( isConnectionHealthy ),
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
			refetchOnWindowFocus: false,
		}
	);
};

export default useFetchTestConnection;
