import { readAchievementsQuery } from '@automattic/api-queries';
import { useInfiniteQuery } from '@tanstack/react-query';

interface UseAchievementsQueryOptions {
	refetchOnMount?: boolean | 'always';
}

/**
 * Reads the achievements list and years of service from a single shared query.
 *
 * The underlying endpoint is paginated. Page 1 is loaded automatically; consumers
 * that need the full list (e.g. the achievements grid) are responsible for calling
 * `fetchNextPage` while `hasNextPage` is true. Consumers that only need page-1
 * data (e.g. badge contexts reading `yearsOfService`) can ignore pagination.
 */
export function useAchievementsQuery(
	userIdOrLogin?: number | string,
	options: UseAchievementsQueryOptions = {}
) {
	const query = useInfiniteQuery( {
		...readAchievementsQuery( userIdOrLogin ),
		enabled: userIdOrLogin != null,
		...options,
	} );

	const dailyPostStreaks = [ ...( query.data?.pages[ 0 ]?.daily_post_streak ?? [] ) ].sort(
		( a, b ) => b.current_streak - a.current_streak
	);

	return {
		achievements: query.data?.pages.flatMap( ( p ) => p.achievements ?? [] ) ?? [],
		lockedAchievements: query.data?.pages[ 0 ]?.locked_achievements ?? [],
		yearsOfService: query.data?.pages[ 0 ]?.years_of_service,
		engagementStreak: query.data?.pages[ 0 ]?.engagement_streak,
		dailyPostStreaks,
		found: query.data?.pages[ 0 ]?.found ?? 0,
		isLoading: query.isLoading,
		isError: query.isError,
		hasNextPage: query.hasNextPage,
		isFetchingNextPage: query.isFetchingNextPage,
		fetchNextPage: query.fetchNextPage,
	};
}
