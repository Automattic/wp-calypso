import { useQuery } from '@tanstack/react-query';
import { buildQueryKey, callApi } from '../helpers';
import { useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { SiteSubscriptionDetailsResponse } from '../types';

const useSiteSubscriptionDetailsQuery = ( blogId = '', subscriptionId = '' ) => {
	const { id, isLoggedIn } = useIsLoggedIn();
	const enabled = useIsQueryEnabled();

	return useQuery( {
		queryKey: buildQueryKey(
			[ 'read', 'site-subscription-details', blogId, subscriptionId ],
			isLoggedIn,
			id
		),
		queryFn: async () => {
			return callApi< SiteSubscriptionDetailsResponse< string > >( {
				path: blogId
					? '/read/sites/' + blogId + '/subscription-details'
					: '/read/subscriptions/' + subscriptionId,
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
