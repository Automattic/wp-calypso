import { useQuery } from '@tanstack/react-query';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { SiteSubscriptionDetailsResponse } from '../types';

const useSiteSubscriptionDetailsQuery = ( siteId: string ) => {
	const { isLoggedIn } = useIsLoggedIn();
	const enabled = useIsQueryEnabled();
	const cacheKey = useCacheKey( [ 'read', 'site-subscription-details', siteId ] );
	return useQuery( {
		queryKey: cacheKey,
		queryFn: async () => {
			const subscriptionDetails = await callApi< SiteSubscriptionDetailsResponse >( {
				path: '/read/sites/' + siteId + '/subscription-details',
				isLoggedIn,
				apiNamespace: 'wpcom/v2',
				apiVersion: '2',
			} );
			return subscriptionDetails;
		},
		enabled,
		refetchOnWindowFocus: false,
	} );
};

export default useSiteSubscriptionDetailsQuery;
