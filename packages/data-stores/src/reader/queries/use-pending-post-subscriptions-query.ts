import { useQuery } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { PendingPostSubscription } from '../types';

type SubscriptionManagerPendingPostSubscriptions = {
	comment_subscriptions: PendingPostSubscription[];
	total_comment_subscriptions_count: number;
};

type SubscriptionManagerPendingPostSubscriptionsQueryProps = {
	filter?: ( item?: PendingPostSubscription ) => boolean;
	sort?: ( a?: PendingPostSubscription, b?: PendingPostSubscription ) => number;
};

const callPendingBlogSubscriptionsEndpoint = async (): Promise< PendingPostSubscription[] > => {
	const data = [];
	const perPage = 1000; // TODO: This is a temporary workaround to get all pending subscriptions. We should remove this once we decide how to handle pagination.

	const incoming = await callApi< SubscriptionManagerPendingPostSubscriptions >( {
		path: `/post-comment-subscriptions?per_page=${ perPage }`,
		apiVersion: '2',
	} );

	if ( incoming && incoming.comment_subscriptions ) {
		data.push(
			...incoming.comment_subscriptions.map( ( pendingSubscription ) => ( {
				...pendingSubscription,
				subscription_date: new Date( pendingSubscription.subscription_date ),
			} ) )
		);
	}

	return data;
};

const defaultFilter = () => true;
const defaultSort = () => 0;

const usePendingPostSubscriptionsQuery = ( {
	filter = defaultFilter,
	sort = defaultSort,
}: SubscriptionManagerPendingPostSubscriptionsQueryProps = {} ) => {
	const isLoggedIn = useIsLoggedIn();
	const enabled = useIsQueryEnabled();

	const { data, ...rest } = useQuery< PendingPostSubscription[] >(
		[ 'read', 'pending-post-subscriptions', isLoggedIn ],
		async () => {
			return await callPendingBlogSubscriptionsEndpoint();
		},
		{
			enabled,
			refetchOnWindowFocus: false,
		}
	);

	return {
		data: data?.filter( filter ).sort( sort ),
		...rest,
	};
};

export default usePendingPostSubscriptionsQuery;
