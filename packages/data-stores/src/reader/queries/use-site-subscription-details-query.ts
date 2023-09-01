import { useQuery } from '@tanstack/react-query';
import { buildQueryKey, callApi } from '../helpers';
import { useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { SiteSubscriptionDetailsResponse } from '../types';

const useSiteSubscriptionDetailsQuery = ( siteId: string ) => {
	const { id, isLoggedIn } = useIsLoggedIn();
	const enabled = useIsQueryEnabled();
	return useQuery( {
		queryKey: buildQueryKey( [ 'read', 'site-subscription-details', siteId ], isLoggedIn, id ),
		queryFn: async () => {
			return callApi< SiteSubscriptionDetailsResponse< string > >( {
				path: '/read/sites/' + siteId + '/subscription-details',
				isLoggedIn,
				apiNamespace: 'wpcom/v2',
				apiVersion: '2',
			} );
		},
		enabled,
		refetchOnWindowFocus: false,
	} );
};

export default useSiteSubscriptionDetailsQuery;
