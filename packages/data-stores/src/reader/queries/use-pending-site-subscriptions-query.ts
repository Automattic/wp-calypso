import { useQuery } from '@tanstack/react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { PendingSiteSubscription, PendingSiteSubscriptionsResult } from '../types';

type SubscriptionManagerPendingSiteSubscriptions = {
	pending_blog_subscriptions: PendingSiteSubscription[];
	total_pending_blog_subscriptions_count: string; // TODO: This should be a number, but the API returns a string.
};

type SubscriptionManagerPendingSiteSubscriptionsQueryProps = {
	filter?: ( item?: PendingSiteSubscription ) => boolean;
	sort?: ( a?: PendingSiteSubscription, b?: PendingSiteSubscription ) => number;
};

const callPendingSiteSubscriptionsEndpoint = async (
	isLoggedIn: boolean
): Promise< PendingSiteSubscriptionsResult > => {
	const pendingSites = [];
	const perPage = 1000; // TODO: This is a temporary workaround to get all pending subscriptions. We should remove this once we decide how to handle pagination.

	const incoming = await callApi< SubscriptionManagerPendingSiteSubscriptions >( {
		path: `/pending-blog-subscriptions?per_page=${ perPage }`,
		apiNamespace: 'wpcom/v2',
		apiVersion: '2',
		isLoggedIn,
	} );

	if ( incoming && incoming.pending_blog_subscriptions ) {
		pendingSites.push(
			...incoming.pending_blog_subscriptions.map( ( pendingSubscription ) => ( {
				...pendingSubscription,
				date_subscribed: new Date( pendingSubscription.date_subscribed ),
			} ) )
		);
	}

	return {
		pendingSites,
		totalCount: parseInt( incoming?.total_pending_blog_subscriptions_count ?? 0 ),
	};
};

const defaultFilter = () => true;
const defaultSort = () => 0;

const usePendingSiteSubscriptionsQuery = ( {
	filter = defaultFilter,
	sort = defaultSort,
}: SubscriptionManagerPendingSiteSubscriptionsQueryProps = {} ) => {
	const { isLoggedIn } = useIsLoggedIn();
	const enabled = useIsQueryEnabled();

	const { data, ...rest } = useQuery< PendingSiteSubscriptionsResult >( {
		queryKey: [ 'read', 'pending-site-subscriptions', isLoggedIn ],
		queryFn: async () => {
			return await callPendingSiteSubscriptionsEndpoint( isLoggedIn );
		},
		enabled,
		refetchOnWindowFocus: false,
	} );

	return {
		data: {
			pendingSites: data?.pendingSites?.filter( filter ).sort( sort ),
			totalCount: data?.totalCount,
		},
		...rest,
	};
};

export default usePendingSiteSubscriptionsQuery;
