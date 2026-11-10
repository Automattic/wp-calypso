import { fetchReadPost, isPostKeyLike } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { ReadPost, ReadPostKey } from '@automattic/api-core';

export const getReaderPostQueryKeyPrefix = () => [ 'read', 'post' ] as const;

export const readerPostQuery = (
	postKey: Partial< ReadPostKey > | null | undefined,
	contentWidth?: number
) => {
	return queryOptions< ReadPost >( {
		queryKey: [ ...getReaderPostQueryKeyPrefix(), postKey, contentWidth ],
		queryFn: () => fetchReadPost( postKey as ReadPostKey, contentWidth ),
		staleTime: 5 * 60 * 1000,
		enabled: isPostKeyLike( postKey ),
		// Memory-only: queryKey includes per-post identifiers and would
		// accumulate stale entries in localStorage across sessions.
		meta: { persist: false },
	} );
};
