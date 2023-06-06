import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useEffect } from 'react';
import { SiteSubscriptionsSortBy } from '../constants';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { SiteSubscription } from '../types';

type SubscriptionManagerSiteSubscriptions = {
	subscriptions: SiteSubscription[];
	page: number;
	total_subscriptions: number;
};

type SubscriptionManagerSiteSubscriptionsQueryProps = {
	searchTerm?: string;
	filter?: ( item?: SiteSubscription ) => boolean;
	sortTerm?: SiteSubscriptionsSortBy;
	number?: number;
};

const sortByDateSubscribed = ( a: SiteSubscription, b: SiteSubscription ) =>
	a.date_subscribed instanceof Date && b.date_subscribed instanceof Date
		? b.date_subscribed.getTime() - a.date_subscribed.getTime()
		: 0;

const sortByLastUpdated = ( a: SiteSubscription, b: SiteSubscription ) =>
	a.last_updated instanceof Date && b.last_updated instanceof Date
		? b.last_updated.getTime() - a.last_updated.getTime()
		: 0;

const sortBySiteName = ( a: SiteSubscription, b: SiteSubscription ) =>
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

const defaultFilter = () => true;

const useSiteSubscriptionsQuery = ( {
	searchTerm = '',
	filter = defaultFilter,
	sortTerm = SiteSubscriptionsSortBy.LastUpdated,
	number = 100,
}: SubscriptionManagerSiteSubscriptionsQueryProps = {} ) => {
	const { isLoggedIn } = useIsLoggedIn();
	const enabled = useIsQueryEnabled();
	const cacheKey = useCacheKey( [ 'read', 'site-subscriptions' ] );

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, ...rest } =
		useInfiniteQuery< SubscriptionManagerSiteSubscriptions >(
			cacheKey,
			async ( { pageParam = 1 } ) => {
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

	const nextPage = hasNextPage && ! isFetching && data ? data.pages.length + 1 : null;

	useEffect( () => {
		if ( nextPage ) {
			fetchNextPage();
		}
	}, [ nextPage, fetchNextPage ] );

	const resultData = useMemo( () => {
		// Flatten all the pages into a single array containing all subscriptions
		const flattenedData = data?.pages?.map( ( page ) => page.subscriptions ).flat();

		const searchTermLowerCase = searchTerm.toLowerCase();
		const searchFilter = ( item: SiteSubscription ) => {
			if ( searchTerm === '' ) {
				return true;
			}

			return (
				item.name.toLowerCase().includes( searchTermLowerCase ) ||
				item.URL.toLowerCase().includes( searchTermLowerCase )
			);
		};
		const sort = getSortFunction( sortTerm );

		return {
			subscriptions:
				flattenedData
					?.filter( ( item ) => item !== null && filter( item ) && searchFilter( item ) )
					.sort( sort ) ?? [],
			totalCount: data?.pages?.[ 0 ]?.total_subscriptions ?? 0,
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ data?.pages, filter, searchTerm, sortTerm ] );

	return {
		data: resultData,
		isFetchingNextPage,
		isFetching,
		hasNextPage,
		...rest,
	};
};

export default useSiteSubscriptionsQuery;
