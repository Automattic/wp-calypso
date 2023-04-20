import { useQuery } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { PendingSiteSubscription } from '../types';

type SubscriptionManagerPendingSiteSubscriptions = {
	pending_blog_subscriptions: PendingSiteSubscription[];
	total_pending_blog_subscriptions_count: string; // TODO: This should be a number, but the API returns a string.
};

type SubscriptionManagerPendingSiteSubscriptionsQueryProps = {
	filter?: ( item?: PendingSiteSubscription ) => boolean;
	sort?: ( a?: PendingSiteSubscription, b?: PendingSiteSubscription ) => number;
};

type PendingSiteSubscriptionQueryResult = {
	pendingSites: PendingSiteSubscription[];
	totalCount: string; // TODO: This should be a number, but the API returns a string.
};

const callPendingSiteSubscriptionsEndpoint =
	async (): Promise< PendingSiteSubscriptionQueryResult > => {
		const pendingSites = [];
		const perPage = 1000; // TODO: This is a temporary workaround to get all pending subscriptions. We should remove this once we decide how to handle pagination.

		const incoming = await callApi< SubscriptionManagerPendingSiteSubscriptions >( {
			path: `/pending-blog-subscriptions?per_page=${ perPage }`,
			apiVersion: '2',
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
			totalCount: incoming.total_pending_blog_subscriptions_count,
		};
	};

const defaultFilter = () => true;
const defaultSort = () => 0;

const usePendingSiteSubscriptionsQuery = ( {
	filter = defaultFilter,
	sort = defaultSort,
}: SubscriptionManagerPendingSiteSubscriptionsQueryProps = {} ) => {
	const isLoggedIn = useIsLoggedIn();
	const enabled = useIsQueryEnabled();

	const { data, ...rest } = useQuery< PendingSiteSubscriptionQueryResult >(
		[ 'read', 'pending-site-subscriptions', isLoggedIn ],
		async () => {
			return await callPendingSiteSubscriptionsEndpoint();
		},
		{
			enabled,
			refetchOnWindowFocus: false,
		}
	);

	return {
		data: {
			pendingSites: data?.pendingSites?.filter( filter ).sort( sort ),
			totalCount: parseInt( data?.totalCount || '0' ),
		},
		...rest,
	};
};

export default usePendingSiteSubscriptionsQuery;
