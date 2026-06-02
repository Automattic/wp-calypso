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
}

export const useSiteSubscriptions = ( {
	fetchAllPages = false,
}: UseSiteSubscriptionsOptions = {} ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const query = useInfiniteQuery( {
		...siteSubscriptionsQuery(),
		enabled: isLoggedIn,
	} );
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = query;

	useEffect( () => {
		if ( fetchAllPages && isLoggedIn && hasNextPage && ! isFetchingNextPage ) {
			fetchNextPage( { cancelRefetch: false } );
		}
	}, [ fetchAllPages, isLoggedIn, hasNextPage, isFetchingNextPage, fetchNextPage ] );

	return Object.assign( {}, query, {
		subscriptions: getSiteSubscriptionsFromData( data ),
		count: getSiteSubscriptionsCountFromData( data ),
	} );
};
