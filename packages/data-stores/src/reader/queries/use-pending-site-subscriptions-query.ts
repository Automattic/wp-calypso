import { useQuery } from '@tanstack/react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { PendingSiteSubscription } from '../types';

type SubscriptionManagerPendingSiteSubscriptions = {
	pending_blog_subscriptions: PendingSiteSubscription[];
	total_pending_blog_subscriptions_count: number;
};

type SubscriptionManagerPendingSiteSubscriptionsQueryProps = {
	filter?: ( item?: PendingSiteSubscription ) => boolean;
	sort?: ( a?: PendingSiteSubscription, b?: PendingSiteSubscription ) => number;
};

const callPendingBlogSubscriptionsEndpoint = async (): Promise< PendingSiteSubscription[] > => {
	const data = [];
	const perPage = 1000; // TODO: This is a temporary workaround to get all pending subscriptions. We should remove this once we decide how to handle pagination.

	const incoming = await callApi< SubscriptionManagerPendingSiteSubscriptions >( {
		path: `/pending-blog-subscriptions?per_page=${ perPage }`,
		apiVersion: '2',
	} );

	if ( incoming && incoming.pending_blog_subscriptions ) {
		data.push(
			...incoming.pending_blog_subscriptions.map( ( pendingSubscription ) => ( {
				...pendingSubscription,
				date_subscribed: new Date( pendingSubscription.date_subscribed ),
			} ) )
		);
	}

	return data;
};

const defaultFilter = () => true;
const defaultSort = () => 0;

const usePendingSiteSubscriptionsQuery = ( {
	filter = defaultFilter,
	sort = defaultSort,
}: SubscriptionManagerPendingSiteSubscriptionsQueryProps = {} ) => {
	const isLoggedIn = useIsLoggedIn();
	const enabled = useIsQueryEnabled();

	const { data, ...rest } = useQuery< PendingSiteSubscription[] >(
		[ 'read', 'pending-site-subscriptions', isLoggedIn ],
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

export default usePendingSiteSubscriptionsQuery;
