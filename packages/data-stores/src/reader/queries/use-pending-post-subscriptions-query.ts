import { useQuery } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { PendingPostSubscription } from '../types';

type SubscriptionManagerPendingPostSubscriptions = {
	comment_subscriptions: PendingPostSubscription[];
	total_comment_subscriptions_count: string; // TODO: This should be a number, but the API returns a string.
};

type SubscriptionManagerPendingPostSubscriptionsQueryProps = {
	filter?: ( item?: PendingPostSubscription ) => boolean;
	sort?: ( a?: PendingPostSubscription, b?: PendingPostSubscription ) => number;
};

type PendingPostSubscriptionQueryResult = {
	pendingPosts: PendingPostSubscription[];
	totalCount: string; // TODO: This should be a number, but the API returns a string.
};

const callPendingBlogSubscriptionsEndpoint =
	async (): Promise< PendingPostSubscriptionQueryResult > => {
		const pendingPosts = [];
		const perPage = 1000; // TODO: This is a temporary workaround to get all pending subscriptions. We should remove this once we decide how to handle pagination.

		const incoming = await callApi< SubscriptionManagerPendingPostSubscriptions >( {
			path: `/post-comment-subscriptions?status=pending&per_page=${ perPage }`,
			apiVersion: '2',
		} );

		if ( incoming && incoming.comment_subscriptions ) {
			pendingPosts.push(
				...incoming.comment_subscriptions.map( ( pendingSubscription ) => ( {
					...pendingSubscription,
					subscription_date: new Date( pendingSubscription.subscription_date ),
				} ) )
			);
		}

		return {
			pendingPosts,
			totalCount: incoming.total_comment_subscriptions_count,
		};
	};

const defaultFilter = () => true;
const defaultSort = () => 0;

const usePendingPostSubscriptionsQuery = ( {
	filter = defaultFilter,
	sort = defaultSort,
}: SubscriptionManagerPendingPostSubscriptionsQueryProps = {} ) => {
	const isLoggedIn = useIsLoggedIn();
	const enabled = useIsQueryEnabled();

	const { data, ...rest } = useQuery< PendingPostSubscriptionQueryResult >(
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
		data: {
			pendingPosts: data?.pendingPosts.filter( filter ).sort( sort ),
			totalCount: data?.totalCount,
		},
		...rest,
	};
};

export default usePendingPostSubscriptionsQuery;
