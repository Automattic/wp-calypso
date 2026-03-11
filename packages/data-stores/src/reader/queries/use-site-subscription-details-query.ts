import { fetchSiteSubscriptionDetails } from '@automattic/api-core';
import { siteSubscriptionDetailsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { buildQueryKey, callApi } from '../helpers';
import { useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { SiteSubscriptionDetailsResponse } from '../types';

const useSiteSubscriptionDetailsQuery = ( blogId = '', subscriptionId = '' ) => {
	const { id, isLoggedIn } = useIsLoggedIn();
	const enabled = useIsQueryEnabled();

	return useQuery( {
		...siteSubscriptionDetailsQuery( blogId, subscriptionId ),
		queryKey: buildQueryKey(
			[ 'read', 'site-subscription-details', blogId, subscriptionId ],
			isLoggedIn,
			id
		),
		queryFn: async () => {
			if ( isLoggedIn ) {
				return fetchSiteSubscriptionDetails( blogId, subscriptionId );
			}
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
