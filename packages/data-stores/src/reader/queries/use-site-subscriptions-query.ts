import {
	adaptSiteSubscriptionsResponse,
	type SiteSubscriptionsApiResponse,
} from '@automattic/api-core';
import { siteSubscriptionsQuery, getSiteSubscriptionsQueryKey } from '@automattic/api-queries';
import { useInfiniteQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import { useMemo, useEffect, useCallback } from 'react';
import { SiteSubscriptionsFilterBy, SiteSubscriptionsSortBy } from '../constants';
import { useSiteSubscriptionsQueryProps } from '../contexts';
import { callApi } from '../helpers';
import { useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { SiteSubscriptionItem } from '../types';

export const siteSubscriptionsQueryKeyPrefix = [ ...getSiteSubscriptionsQueryKey() ];

const sortByDateSubscribed = ( a: SiteSubscriptionItem, b: SiteSubscriptionItem ) =>
	a.date_subscribed instanceof Date && b.date_subscribed instanceof Date
		? b.date_subscribed.getTime() - a.date_subscribed.getTime()
		: 0;

const sortByLastUpdated = ( a: SiteSubscriptionItem, b: SiteSubscriptionItem ) =>
	a.last_updated instanceof Date && b.last_updated instanceof Date
		? b.last_updated.getTime() - a.last_updated.getTime()
		: 0;

const sortBySiteName = ( a: SiteSubscriptionItem, b: SiteSubscriptionItem ) =>
	( a.name ?? '' ).localeCompare( b.name ?? '' );

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

const useSiteSubscriptionsQuery = () => {
	const { isLoggedIn } = useIsLoggedIn();
	const enabled = useIsQueryEnabled();
	const { searchTerm, filterOption, sortTerm } = useSiteSubscriptionsQueryProps();

	const query = useInfiniteQuery( {
		...siteSubscriptionsQuery(),
		queryFn: async ( { pageParam } ) => {
			const response = await callApi< SiteSubscriptionsApiResponse >( {
				path: addQueryArgs( '/read/following/mine', {
					page: pageParam,
					number: 200,
					meta: '',
				} ),
				apiVersion: '1.2',
				isLoggedIn,
			} );

			return adaptSiteSubscriptionsResponse( response );
		},
		enabled,
	} );
	const {
		data,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isFetching,
		isLoading,
		refetch,
	} = query;

	const nextPage = hasNextPage && ! isFetching && data ? data.pages.length + 1 : null;

	useEffect( () => {
		if ( nextPage ) {
			fetchNextPage();
		}
	}, [ nextPage, fetchNextPage ] );

	const filterFunction = useCallback(
		( item: SiteSubscriptionItem ) => {
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
		const searchFilter = ( item: SiteSubscriptionItem ) => {
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
			totalCount: data?.pages?.[ 0 ]?.totalCount ?? 0,
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ data?.pages, filterOption, searchTerm, sortTerm ] );

	return {
		data: resultData,
		error,
		isFetchingNextPage,
		isFetching,
		hasNextPage,
		isLoading,
		refetch,
	};
};

export default useSiteSubscriptionsQuery;
