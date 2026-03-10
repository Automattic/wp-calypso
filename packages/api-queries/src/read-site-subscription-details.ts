import { fetchSiteSubscriptionDetails } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteSubscriptionDetailsQuery = (
	blogId?: string,
	subscriptionId?: string
) => {
	return queryOptions( {
		queryKey: [ 'read', 'site-subscription-details', blogId, subscriptionId ],
		queryFn: () => fetchSiteSubscriptionDetails( blogId, subscriptionId ),
	} );
};
