import { trophiesQuery } from '@automattic/api-queries';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useTrophiesQuery() {
	const query = useInfiniteQuery( {
		...trophiesQuery(),
		staleTime: 10 * 60 * 1000, // 10 minutes
	} );

	const { hasNextPage, isFetchingNextPage, isError, fetchNextPage } = query;

	useEffect( () => {
		if ( hasNextPage && ! isFetchingNextPage && ! isError ) {
			fetchNextPage();
		}
	}, [ hasNextPage, isFetchingNextPage, isError, fetchNextPage ] );

	return {
		trophies: query.data?.pages.flatMap( ( p ) => p.trophies ?? [] ) ?? [],
		found: query.data?.pages[ 0 ]?.found ?? 0,
		isLoading: ( query.isLoading || hasNextPage ) && ! isError,
		isError,
	};
}
