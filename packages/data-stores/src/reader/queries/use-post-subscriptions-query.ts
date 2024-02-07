import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { PostSubscriptionsSortBy, SiteSubscriptionsFilterBy } from '../constants';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { PostSubscription } from '../types';

export const postSubscriptionsQueryKeyPrefix = [ 'read', 'post-subscriptions' ];

type SubscriptionManagerPostSubscriptions = {
	comment_subscriptions: PostSubscription[];
	total_comment_subscriptions_count: number;
};

type PostSubscriptionsQueryProps = {
	searchTerm?: string;
	filterOption?: SiteSubscriptionsFilterBy;
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

const usePostSubscriptionsQuery = ( {
	searchTerm = '',
	filterOption = SiteSubscriptionsFilterBy.All,
	sortTerm = PostSubscriptionsSortBy.RecentlySubscribed,
	number = 500,
}: PostSubscriptionsQueryProps = {} ) => {
	const { isLoggedIn } = useIsLoggedIn();
	const enabled = useIsQueryEnabled();
	const cacheKey = useCacheKey( postSubscriptionsQueryKeyPrefix );

	const infiniteQuery = useInfiniteQuery< SubscriptionManagerPostSubscriptions >( {
		queryKey: cacheKey,
		queryFn: async ( { pageParam } ) => {
			const result = await callApi< SubscriptionManagerPostSubscriptions >( {
				path: `/post-comment-subscriptions?per_page=${ number }&page=${ pageParam }`,
				isLoggedIn,
				apiVersion: '2',
				apiNamespace: 'wpcom/v2',
			} );

			return result;
		},
		enabled,
		initialPageParam: 1,
		getNextPageParam: ( lastPage, pages ) =>
			pages.length * number >= lastPage.total_comment_subscriptions_count
				? undefined
				: pages.length + 1,
		refetchOnWindowFocus: false,
	} );

	const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } = infiniteQuery;

	useEffect( () => {
		if ( hasNextPage && ! isFetchingNextPage && ! isFetching ) {
			fetchNextPage();
		}
	}, [ hasNextPage, isFetchingNextPage, isFetching, fetchNextPage ] );

	const filterFunction = useCallback(
		( item: PostSubscription ) => {
			switch ( filterOption ) {
				case SiteSubscriptionsFilterBy.Paid:
					return item.is_paid_subscription;
				case SiteSubscriptionsFilterBy.P2:
					return item.is_wpforteams_site;
				case SiteSubscriptionsFilterBy.All:
				default:
					return true;
			}
		},
		[ filterOption ]
	);

	const outputData = useMemo( () => {
		// Flatten all the pages into a single array containing all subscriptions
		const flattenedData = data?.pages?.map( ( page ) => page.comment_subscriptions ).flat();

		// TODO: Temporary fix for https://github.com/Automattic/wp-calypso/issues/76678, remove once fixed
		const filteredData = flattenedData?.filter(
			( comment_subscription ) => typeof comment_subscription?.post_url === 'string'
		);

		// Transform the dates into Date objects
		const transformedData = filteredData?.map( ( comment_subscription ) => ( {
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
				?.filter( ( item ) => item && filterFunction( item ) && searchFilter( item ) )
				.sort( sort ),
			totalCount: data?.pages?.[ 0 ]?.total_comment_subscriptions_count ?? 0,
		};
	}, [ data?.pages, filterFunction, searchTerm, sortTerm ] );

	return {
		...infiniteQuery,
		data: outputData,
		isFetchingNextPage,
		isFetching,
		hasNextPage,
	};
};

export default usePostSubscriptionsQuery;
