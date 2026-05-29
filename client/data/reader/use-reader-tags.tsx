import { readTagQuery, readTagsQuery, type ReaderTag } from '@automattic/api-queries';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';

/**
 * Returns the full React Query result for the current user's followed tags.
 * Consumers can read `data`, `isPending`, `isError`, `refetch`, etc. directly.
 */
export function useFollowedReaderTags(): UseQueryResult< ReaderTag[] > {
	const locale = useSelector( getCurrentUserLocale );
	return useQuery( readTagsQuery( locale ) );
}

/**
 * Returns the React Query result for a single reader tag by slug, augmented
 * with `isNotFound` (true when the API responds 404 for the slug).
 */
export function useReaderTagBySlug(
	slug: string | null | undefined
): UseQueryResult< ReaderTag | null > & { isNotFound: boolean } {
	const locale = useSelector( getCurrentUserLocale );
	const query = useQuery( readTagQuery( slug ?? '', locale ) );

	const isNotFound =
		!! slug && query.isError && ( query.error as { status?: number } | undefined )?.status === 404;

	return { ...query, isNotFound };
}
