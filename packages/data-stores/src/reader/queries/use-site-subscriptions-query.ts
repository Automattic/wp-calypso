import { useEffect } from 'react';
import { useInfiniteQuery } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { SiteSubscription } from '../types';

type SubscriptionManagerSiteSubscriptions = {
	subscriptions: SiteSubscription[];
	page: number;
	total_subscriptions: number;
};

type SubscriptionManagerSiteSubscriptionsQueryProps = {
	filter?: ( item?: SiteSubscription ) => boolean;
	sort?: ( a?: SiteSubscription, b?: SiteSubscription ) => number;
	number?: number;
};

const defaultFilter = () => true;
const defaultSort = () => 0;

const useSiteSubscriptionsQuery = ( {
	filter = defaultFilter,
	sort = defaultSort,
	number = 100,
}: SubscriptionManagerSiteSubscriptionsQueryProps = {} ) => {
	const isLoggedIn = useIsLoggedIn();
	const enabled = useIsQueryEnabled();

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, ...rest } =
		useInfiniteQuery< SubscriptionManagerSiteSubscriptions >(
			[ 'read', 'site-subscriptions', isLoggedIn ],
			async ( { pageParam = 1 } ) => {
				return await callApi< SubscriptionManagerSiteSubscriptions >( {
					path: `/read/following/mine?number=${ number }&page=${ pageParam }`,
					isLoggedIn,
					apiVersion: '1.2',
				} );
			},
			{
				enabled,
				getNextPageParam: ( lastPage, pages ) => {
					return lastPage.page * number < lastPage.total_subscriptions
						? pages.length + 1
						: undefined;
				},
				refetchOnWindowFocus: false,
			}
		);

	useEffect( () => {
		if ( hasNextPage && ! isFetchingNextPage && ! isFetching ) {
			fetchNextPage();
		}
	}, [ hasNextPage, isFetchingNextPage, isFetching, fetchNextPage ] );

	// Flatten all the pages into a single array containing all subscriptions
	const flattenedData = data?.pages?.map( ( page ) => page.subscriptions ).flat();
	// Transform the dates into Date objects
	const transformedData = flattenedData?.map( ( subscription ) => ( {
		...subscription,
		last_updated: new Date( subscription.last_updated ),
		date_subscribed: new Date( subscription.date_subscribed ),
	} ) );

	return {
		data: transformedData?.filter( filter ).sort( sort ),
		...rest,
	};
};

export default useSiteSubscriptionsQuery;
