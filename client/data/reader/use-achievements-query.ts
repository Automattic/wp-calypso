import { readAchievementsQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useAchievementsQuery( userIdOrLogin?: number | string ) {
	const enabled = isEnabled( 'reader/achievements' ) && userIdOrLogin != null;
	const query = useInfiniteQuery( {
		...readAchievementsQuery( userIdOrLogin ?? '' ),
		enabled,
	} );

	return {
		achievements: query.data?.pages.flatMap( ( p ) => p.achievements ?? [] ) ?? [],
		yearsOfService: query.data?.pages[ 0 ]?.years_of_service,
		found: query.data?.pages[ 0 ]?.found ?? 0,
		isLoading: query.isLoading,
		isError: query.isError,
		hasNextPage: query.hasNextPage,
		isFetchingNextPage: query.isFetchingNextPage,
		fetchNextPage: query.fetchNextPage,
	};
}
