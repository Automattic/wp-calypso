import { useEffect } from 'react';
import { useInfiniteQuery } from 'react-query';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { PostSubscription } from '../types';

type SubscriptionManagerPostSubscriptions = {
	comment_subscriptions: PostSubscription[];
	total_comment_subscriptions_count: number;
};

type SubscriptionManagerPostSubscriptionsQueryProps = {
	filter?: ( item?: PostSubscription ) => boolean;
	sort?: ( a?: PostSubscription, b?: PostSubscription ) => number;
	number?: number;
};

const defaultFilter = () => true;
const defaultSort = () => 0;

const usePostSubscriptionsQuery = ( {
	filter = defaultFilter,
	sort = defaultSort,
	number = 100,
}: SubscriptionManagerPostSubscriptionsQueryProps = {} ) => {
	const { isLoggedIn } = useIsLoggedIn();
	const enabled = useIsQueryEnabled();
	const cacheKey = useCacheKey( [ 'read', 'post-subscriptions' ] );

	const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, ...rest } =
		useInfiniteQuery< SubscriptionManagerPostSubscriptions >(
			cacheKey,
			async ( { pageParam = 1 } ) => {
				return await callApi< SubscriptionManagerPostSubscriptions >( {
					path: `/post-comment-subscriptions?per_page=${ number }&page=${ pageParam }`,
					isLoggedIn,
					apiVersion: '2',
				} );
			},
			{
				enabled,
				getNextPageParam: ( lastPage, pages ) => {
					return pages.length < lastPage.total_comment_subscriptions_count
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
	const flattenedData = data?.pages?.map( ( page ) => page.comment_subscriptions ).flat();
	// Transform the dates into Date objects
	const transformedData = flattenedData?.map( ( comment_subscription ) => ( {
		...comment_subscription,
		subscription_date: new Date( comment_subscription.subscription_date ),
	} ) );

	return {
		data: transformedData?.filter( filter ).sort( sort ),
		isFetchingNextPage,
		isFetching,
		hasNextPage,
		...rest,
	};
};

export default usePostSubscriptionsQuery;
