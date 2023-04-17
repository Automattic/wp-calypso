import { useEffect, useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';
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
	sort?: ( a?: SiteSubscription, b?: SiteSubscription ) => number;
	number?: number;
};

const defaultFilter = () => true;
const defaultSort = () => 0;

const useSiteSubscriptionsQuery = ( {
	searchTerm = '',
	filter = defaultFilter,
	sort = defaultSort,
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

	useEffect( () => {
		if ( hasNextPage && ! isFetchingNextPage && ! isFetching ) {
			fetchNextPage();
		}
	}, [ hasNextPage, isFetchingNextPage, isFetching, fetchNextPage ] );

	const resultData = useMemo( () => {
		// Flatten all the pages into a single array containing all subscriptions
		const flattenedData = data?.pages?.map( ( page ) => page.subscriptions ).flat();

		const searchFilter = ( item: SiteSubscription ) => {
			if ( searchTerm === '' ) {
				return true;
			}

			const searchTermLowerCase = searchTerm.toLowerCase();
			return (
				item.name.toLowerCase().includes( searchTermLowerCase ) ||
				item.URL.toLowerCase().includes( searchTermLowerCase )
			);
		};

		return {
			subscriptions:
				flattenedData
					?.filter( ( item ) => item !== null && filter( item ) && searchFilter( item ) )
					.sort( sort ) ?? [],
			totalCount: data?.pages?.[ 0 ]?.total_subscriptions ?? 0,
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ data?.pages, filter, searchTerm, sort ] );

	return {
		data: resultData,
		isFetchingNextPage,
		isFetching,
		hasNextPage,
		...rest,
	};
};

export default useSiteSubscriptionsQuery;
