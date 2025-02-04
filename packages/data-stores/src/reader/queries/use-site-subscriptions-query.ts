import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useEffect, useCallback } from 'react';
import { SiteSubscriptionsFilterBy, SiteSubscriptionsSortBy } from '../constants';
import { useSiteSubscriptionsQueryProps } from '../contexts';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { SiteSubscriptionsResponseItem } from '../types';

export const siteSubscriptionsQueryKeyPrefix = [ 'read', 'site-subscriptions' ];

type SubscriptionManagerSiteSubscriptions = {
	subscriptions: SiteSubscriptionsResponseItem[];
	page: number;
	total_subscriptions: number;
};

type SubscriptionManagerSiteSubscriptionsQueryProps = {
	number?: number;
};

const sortByDateSubscribed = (
	a: SiteSubscriptionsResponseItem,
	b: SiteSubscriptionsResponseItem
) =>
	a.date_subscribed instanceof Date && b.date_subscribed instanceof Date
		? b.date_subscribed.getTime() - a.date_subscribed.getTime()
		: 0;

const sortByLastUpdated = ( a: SiteSubscriptionsResponseItem, b: SiteSubscriptionsResponseItem ) =>
	a.last_updated instanceof Date && b.last_updated instanceof Date
		? b.last_updated.getTime() - a.last_updated.getTime()
		: 0;

const sortBySiteName = ( a: SiteSubscriptionsResponseItem, b: SiteSubscriptionsResponseItem ) =>
	a.name.localeCompare( b.name );

const getSortFunction = ( sortTerm: SiteSubscriptionsSortBy ) => {
	switch ( sortTerm ) {
		case SiteSubscriptionsSortBy.DateSubscribed:
			return sortByDateSubscribed;
		case SiteSubscriptionsSortBy.LastUpdated:
			return sortByLastUpdated;
		case SiteSubscriptionsSortBy.SiteName:
			return sortBySiteName;
		default:
			return undefined;
	}
};

const useSiteSubscriptionsQuery = ( {
	number = 100,
}: SubscriptionManagerSiteSubscriptionsQueryProps = {} ) => {
	const { isLoggedIn } = useIsLoggedIn();
	const enabled = useIsQueryEnabled();
	const cacheKey = useCacheKey( siteSubscriptionsQueryKeyPrefix );
	const { searchTerm, filterOption, sortTerm } = useSiteSubscriptionsQueryProps();

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, ...rest } =
		useInfiniteQuery< SubscriptionManagerSiteSubscriptions >( {
			queryKey: cacheKey,
			queryFn: async ( { pageParam } ) => {
				const data = await callApi< SubscriptionManagerSiteSubscriptions >( {
					path: `/read/following/mine?number=${ number }&page=${ pageParam }`,
					isLoggedIn,
					apiVersion: '1.2',
				} );

				return {
					...data,
					subscriptions: data.subscriptions
						? data.subscriptions.map( ( subscription ) => ( {
								...subscription,
								last_updated: new Date( subscription.last_updated ),
								date_subscribed: new Date( subscription.date_subscribed ),
						  } ) )
						: [],
				};
			},
			enabled,
			initialPageParam: 1,
			getNextPageParam: ( lastPage, pages ) => {
				return lastPage.page * number < lastPage.total_subscriptions ? pages.length + 1 : undefined;
			},
			refetchOnWindowFocus: false,
		} );

	const nextPage = hasNextPage && ! isFetching && data ? data.pages.length + 1 : null;

	useEffect( () => {
		if ( nextPage ) {
			fetchNextPage();
		}
	}, [ nextPage, fetchNextPage ] );

	const filterFunction = useCallback(
		( item: SiteSubscriptionsResponseItem ) => {
			switch ( filterOption ) {
				case SiteSubscriptionsFilterBy.Paid:
					return item.is_paid_subscription;
				case SiteSubscriptionsFilterBy.P2:
					return item.is_wpforteams_site;
				case SiteSubscriptionsFilterBy.RSS:
					return item.is_rss;
				case SiteSubscriptionsFilterBy.All:
				default:
					return true;
			}
		},
		[ filterOption ]
	);

	const resultData = useMemo( () => {
		// Flatten all the pages into a single array containing all subscriptions
		const flattenedData = data?.pages?.map( ( page ) => page.subscriptions ).flat();

		const searchTermLowerCase = searchTerm.toLowerCase();
		const searchFilter = ( item: SiteSubscriptionsResponseItem ) => {
			if ( searchTerm === '' ) {
				return true;
			}

			return (
				item?.name?.toLowerCase?.().includes( searchTermLowerCase ) ||
				item?.URL?.toLowerCase?.().includes( searchTermLowerCase )
			);
		};
		const sort = getSortFunction( sortTerm );

		return {
			subscriptions:
				flattenedData
					?.filter( ( item ) => item !== null && filterFunction( item ) && searchFilter( item ) )
					.sort( sort ) ?? [],
			totalCount: data?.pages?.[ 0 ]?.total_subscriptions ?? 0,
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ data?.pages, filterOption, searchTerm, sortTerm ] );

	return {
		data: resultData,
		isFetchingNextPage,
		isFetching,
		hasNextPage,
		...rest,
	};
};

export default useSiteSubscriptionsQuery;
