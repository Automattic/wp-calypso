import { followsQuery, getFollowsCountFromData, getFollowsFromData } from '@automattic/api-queries';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useFollows = () => {
	const query = useInfiniteQuery( followsQuery() );

	useEffect( () => {
		if ( query.hasNextPage && ! query.isFetchingNextPage ) {
			query.fetchNextPage();
		}
	}, [ query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage ] );

	return {
		...query,
		follows: getFollowsFromData( query.data ),
		count: getFollowsCountFromData( query.data ),
	};
};
