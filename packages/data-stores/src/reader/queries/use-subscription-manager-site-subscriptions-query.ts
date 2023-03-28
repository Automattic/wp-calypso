import { useQuery } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { SiteSubscription } from '../types';

type SubscriptionManagerSiteSubscriptions = {
	subscriptions: SiteSubscription[];
	page: number;
	total_subscriptions: number;
};

const callFollowingEndPoint = async (
	page: number,
	limit: number,
	isLoggedIn: boolean
): Promise< SiteSubscription[] > => {
	const data = [];

	const incoming = await callApi< SubscriptionManagerSiteSubscriptions >( {
		path: `/read/following/mine?limit=${ limit }&page=${ page }`,
		isLoggedIn,
		apiVersion: '1.2',
	} );

	if ( incoming && incoming.subscriptions ) {
		data.push( ...incoming.subscriptions );
	}

	if ( incoming.page * limit < incoming.total_subscriptions ) {
		const next = await callFollowingEndPoint( page + 1, limit, isLoggedIn );
		data.push( ...next );
	}

	return data;
};

const useSubscriptionManagerSiteSubscriptionsQuery = () => {
	const isLoggedIn = useIsLoggedIn();
	const enabled = useIsQueryEnabled();

	return useQuery< SiteSubscription[] >(
		[ 'read', 'site-subscriptions', isLoggedIn ],
		async () => {
			return await callFollowingEndPoint( 1, 200, isLoggedIn );
		},
		{
			enabled,
			refetchOnWindowFocus: false,
		}
	);
};

export { useSubscriptionManagerSiteSubscriptionsQuery };
