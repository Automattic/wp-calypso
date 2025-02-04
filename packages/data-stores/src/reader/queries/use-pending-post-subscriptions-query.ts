import { useQuery } from '@tanstack/react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { PendingPostSubscription, PendingPostSubscriptionsResult } from '../types';

type SubscriptionManagerPendingPostSubscriptions = {
	comment_subscriptions: PendingPostSubscription[];
	total_comment_subscriptions_count: number;
};

type SubscriptionManagerPendingPostSubscriptionsQueryProps = {
	filter?: ( item?: PendingPostSubscription ) => boolean;
	sort?: ( a?: PendingPostSubscription, b?: PendingPostSubscription ) => number;
};

const callPendingBlogSubscriptionsEndpoint = async (
	isLoggedIn: boolean
): Promise< PendingPostSubscriptionsResult > => {
	const pendingPosts = [];
	const perPage = 1000; // TODO: This is a temporary workaround to get all pending subscriptions. We should remove this once we decide how to handle pagination.

	const incoming = await callApi< SubscriptionManagerPendingPostSubscriptions >( {
		path: `/post-comment-subscriptions?status=pending&per_page=${ perPage }`,
		apiNamespace: 'wpcom/v2',
		apiVersion: '2',
		isLoggedIn,
	} );

	if ( incoming && incoming.comment_subscriptions ) {
		pendingPosts.push(
			...incoming.comment_subscriptions.map( ( pendingSubscription ) => ( {
				...pendingSubscription,
				date_subscribed: new Date( pendingSubscription.date_subscribed ),
			} ) )
		);
	}

	return {
		pendingPosts,
		totalCount: incoming?.total_comment_subscriptions_count ?? 0,
	};
};

const defaultFilter = () => true;
const defaultSort = () => 0;

const usePendingPostSubscriptionsQuery = ( {
	filter = defaultFilter,
	sort = defaultSort,
}: SubscriptionManagerPendingPostSubscriptionsQueryProps = {} ) => {
	const { isLoggedIn } = useIsLoggedIn();
	const enabled = useIsQueryEnabled();

	const { data, ...rest } = useQuery< PendingPostSubscriptionsResult >( {
		queryKey: [ 'read', 'pending-post-subscriptions', isLoggedIn ],
		queryFn: async () => {
			return await callPendingBlogSubscriptionsEndpoint( isLoggedIn );
		},
		enabled,
		refetchOnWindowFocus: false,
	} );

	return {
		data: {
			pendingPosts: data?.pendingPosts?.filter( filter ).sort( sort ),
			totalCount: data?.totalCount,
		},
		...rest,
	};
};

export default usePendingPostSubscriptionsQuery;
