import { trophiesQuery } from '@automattic/api-queries';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useTrophiesQuery() {
	const query = useInfiniteQuery( trophiesQuery() );

	const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

	useEffect( () => {
		if ( hasNextPage && ! isFetchingNextPage ) {
			fetchNextPage();
		}
	}, [ hasNextPage, isFetchingNextPage, fetchNextPage ] );

	return {
		trophies: query.data?.pages.flatMap( ( p ) => p.trophies ?? [] ) ?? [],
		found: query.data?.pages[ 0 ]?.found ?? 0,
		isLoading: query.isLoading,
	};
}
