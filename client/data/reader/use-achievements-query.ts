import { readAchievementsQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useInfiniteQuery } from '@tanstack/react-query';

/**
 * Reads the achievements list and years of service from a single shared query.
 *
 * The underlying endpoint is paginated. Page 1 is loaded automatically; consumers
 * that need the full list (e.g. the achievements grid) are responsible for calling
 * `fetchNextPage` while `hasNextPage` is true. Consumers that only need page-1
 * data (e.g. badge contexts reading `yearsOfService`) can ignore pagination.
 */
export function useAchievementsQuery( userIdOrLogin?: number | string ) {
	const enabled = isEnabled( 'reader/achievements' ) && userIdOrLogin != null;
	const query = useInfiniteQuery( {
		...readAchievementsQuery( userIdOrLogin ),
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
