import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { PostSubscription } from '../types';

export enum PostSubscriptionsSortBy {
	PostName = 'post_name',
	RecentlyCommented = 'recently_commented',
	RecentlySubscribed = 'recently_subscribed',
}

type SubscriptionManagerPostSubscriptions = {
	comment_subscriptions: PostSubscription[];
	total_comment_subscriptions_count: number;
};

type SubscriptionManagerPostSubscriptionsQueryProps = {
	searchTerm?: string;
	filter?: ( item?: PostSubscription ) => boolean;
	sortTerm?: PostSubscriptionsSortBy;
	number?: number;
};

const sortByPostName = ( a: PostSubscription, b: PostSubscription ) =>
	a.post_title.localeCompare( b.post_title );

const sortByRecentlySubscribed = ( a: PostSubscription, b: PostSubscription ) =>
	b.date_subscribed.getTime() - a.date_subscribed.getTime();

const getSortFunction = ( sortTerm: PostSubscriptionsSortBy ) => {
	switch ( sortTerm ) {
		case PostSubscriptionsSortBy.PostName:
			return sortByPostName;
		default:
		case PostSubscriptionsSortBy.RecentlySubscribed:
			return sortByRecentlySubscribed;
	}
};

const defaultFilter = () => true;

const usePostSubscriptionsQuery = ( {
	searchTerm = '',
	filter = defaultFilter,
	sortTerm = PostSubscriptionsSortBy.RecentlySubscribed,
	number = 500,
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
					const total = pages.reduce( ( sum, page ) => sum + page.comment_subscriptions.length, 0 );
					return total < lastPage.total_comment_subscriptions_count ? pages.length + 1 : undefined;
				},
				refetchOnWindowFocus: false,
			}
		);

	useEffect( () => {
		if ( hasNextPage && ! isFetchingNextPage && ! isFetching ) {
			fetchNextPage();
		}
	}, [ hasNextPage, isFetchingNextPage, isFetching, fetchNextPage ] );

	const outputData = useMemo( () => {
		// Flatten all the pages into a single array containing all subscriptions
		const flattenedData = data?.pages?.map( ( page ) => page.comment_subscriptions ).flat();

		// Transform the dates into Date objects
		const transformedData = flattenedData?.map( ( comment_subscription ) => ( {
			...comment_subscription,
			date_subscribed: new Date( comment_subscription.date_subscribed ),
		} ) );

		const searchTermLowerCase = searchTerm.toLowerCase();

		const searchFilter = ( item: PostSubscription ) =>
			searchTermLowerCase
				? item.post_title.toLocaleLowerCase().includes( searchTermLowerCase ) ||
				  item.post_excerpt.toLocaleLowerCase().includes( searchTermLowerCase ) ||
				  item.post_url.includes( searchTermLowerCase ) ||
				  item.site_title.toLocaleLowerCase().includes( searchTermLowerCase )
				: true;
		const sort = getSortFunction( sortTerm );

		return {
			posts: transformedData
				?.filter( ( item ) => item && filter( item ) && searchFilter( item ) )
				.sort( sort ),
			totalCount: data?.pages?.[ 0 ]?.total_comment_subscriptions_count ?? 0,
		};
	}, [ data?.pages, filter, searchTerm, sortTerm ] );

	return {
		data: outputData,
		isFetchingNextPage,
		isFetching,
		hasNextPage,
		...rest,
	};
};

export default usePostSubscriptionsQuery;
