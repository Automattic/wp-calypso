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

export const useSiteSubscriptions = ( {
	fetchAllPages = false,
	enabled = true,
}: UseSiteSubscriptionsOptions = {} ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isEnabled = enabled && isLoggedIn;
	const query = useInfiniteQuery( {
		...siteSubscriptionsQuery(),
		enabled: isEnabled,
	} );
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = query;

	useEffect( () => {
		if ( fetchAllPages && isEnabled && hasNextPage && ! isFetchingNextPage ) {
			fetchNextPage( { cancelRefetch: false } );
		}
	}, [ fetchAllPages, isEnabled, hasNextPage, isFetchingNextPage, fetchNextPage ] );

	return Object.assign( {}, query, {
		subscriptions: getSiteSubscriptionsFromData( data ),
		count: getSiteSubscriptionsCountFromData( data ),
	} );
};
