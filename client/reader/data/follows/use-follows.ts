import { followsQuery, getFollowsCountFromData, getFollowsFromData } from '@automattic/api-queries';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export const useFollows = () => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const query = useInfiniteQuery( {
		...followsQuery(),
		enabled: isLoggedIn,
	} );

	useEffect( () => {
		if ( isLoggedIn && query.hasNextPage && ! query.isFetchingNextPage ) {
			query.fetchNextPage( { cancelRefetch: false } );
		}
	}, [ isLoggedIn, query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage ] );

	return {
		...query,
		follows: getFollowsFromData( query.data ),
		count: getFollowsCountFromData( query.data ),
	};
};
