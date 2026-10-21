import {
	siteSubscriptionsQuery,
	getSiteSubscriptionsCountFromData,
	getSiteSubscriptionsFromData,
} from '@automattic/api-queries';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

interface UseSiteSubscriptionsOptions {
	fetchAllPages?: boolean;
	enabled?: boolean;
}

interface UseSiteSubscriptionsQueryOptions {
	refetchOnMount?: ReturnType< typeof siteSubscriptionsQuery >[ 'refetchOnMount' ];
}

export const useSiteSubscriptions = (
	{ fetchAllPages = false, enabled = true }: UseSiteSubscriptionsOptions = {},
	queryOptions?: UseSiteSubscriptionsQueryOptions
) => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isEnabled = enabled && isLoggedIn;
	const query = useInfiniteQuery( {
		...siteSubscriptionsQuery(),
		...queryOptions,
		enabled: isEnabled,
	} );
	const { data, fetchNextPage, hasNextPage, isFetching } = query;

	useEffect( () => {
		if ( fetchAllPages && isEnabled && hasNextPage && ! isFetching ) {
			fetchNextPage( { cancelRefetch: false } );
		}
	}, [ fetchAllPages, isEnabled, hasNextPage, isFetching, fetchNextPage ] );

	return Object.assign( {}, query, {
		subscriptions: getSiteSubscriptionsFromData( data ),
		count: getSiteSubscriptionsCountFromData( data ),
	} );
};
