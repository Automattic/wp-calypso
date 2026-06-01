import { followsQuery, getFollowsCountFromData, getFollowsFromData } from '@automattic/api-queries';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

interface UseFollowsOptions {
	fetchAllPages?: boolean;
}

export const useFollows = ( { fetchAllPages = false }: UseFollowsOptions = {} ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const query = useInfiniteQuery( {
		...followsQuery(),
		enabled: isLoggedIn,
	} );
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = query;

	useEffect( () => {
		if ( fetchAllPages && isLoggedIn && hasNextPage && ! isFetchingNextPage ) {
			fetchNextPage( { cancelRefetch: false } );
		}
	}, [ fetchAllPages, isLoggedIn, hasNextPage, isFetchingNextPage, fetchNextPage ] );

	return Object.assign( {}, query, {
		follows: getFollowsFromData( data ),
		count: getFollowsCountFromData( data ),
	} );
};
