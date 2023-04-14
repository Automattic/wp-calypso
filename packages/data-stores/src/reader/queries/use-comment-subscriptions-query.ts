import { useEffect } from 'react';
import { useInfiniteQuery } from 'react-query';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { CommentSubscription } from '../types';

type SubscriptionManagerCommentSubscriptions = {
	comment_subscriptions: CommentSubscription[];
	total_comment_subscriptions_count: number;
};

type SubscriptionManagerCommentSubscriptionsQueryProps = {
	filter?: ( item?: CommentSubscription ) => boolean;
	sort?: ( a?: CommentSubscription, b?: CommentSubscription ) => number;
	number?: number;
};

const defaultFilter = () => true;
const defaultSort = () => 0;

const useCommentSubscriptionsQuery = ( {
	filter = defaultFilter,
	sort = defaultSort,
	number = 100,
}: SubscriptionManagerCommentSubscriptionsQueryProps = {} ) => {
	const { isLoggedIn } = useIsLoggedIn();
	const enabled = useIsQueryEnabled();
	const cacheKey = useCacheKey( [ 'read', 'comment-subscriptions' ] );

	const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, ...rest } =
		useInfiniteQuery< SubscriptionManagerCommentSubscriptions >(
			cacheKey,
			async ( { pageParam = 1 } ) => {
				return await callApi< SubscriptionManagerCommentSubscriptions >( {
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

export default useCommentSubscriptionsQuery;
