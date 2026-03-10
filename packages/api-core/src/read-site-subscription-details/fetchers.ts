import { wpcom } from '../wpcom-fetcher';
import type { SiteSubscriptionDetailsResponse } from './types';

export const fetchSiteSubscriptionDetails = (
	blogId?: string,
	subscriptionId?: string
): Promise< SiteSubscriptionDetailsResponse< string > > => {
	const path = blogId
		? `/read/sites/${ blogId }/subscription-details`
		: `/read/subscriptions/${ subscriptionId }`;

	return wpcom.req.get( {
		path,
		apiNamespace: 'wpcom/v2',
		apiVersion: '2',
		method: 'GET',
	} );
};
