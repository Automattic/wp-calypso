import { isSeenPostsAvailable, readTeamsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

export { isSeenPostsAvailable };

/**
 * React hook for {@link isSeenPostsAvailable}.
 */
export function useIsSeenPostsAvailable(): boolean {
	const { data } = useQuery( readTeamsQuery() );
	return isSeenPostsAvailable( data?.teams );
}
