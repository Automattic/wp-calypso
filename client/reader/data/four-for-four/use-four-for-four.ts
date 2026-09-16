import {
	getReadFourForFourStatusQueryKey,
	readFourForFourCandidatesQuery,
	readFourForFourStatusQuery,
	recordReadFourForFourProgressMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { ReadFourForFourStatusResponse } from '@automattic/api-core';

interface UseFourForFourOptions {
	/** Called once, when the server first reports the program as completed. */
	onComplete?: ( status: ReadFourForFourStatusResponse ) => void;
}

/**
 * Candidate sites plus the user's progress through the 4 for 4 program.
 *
 * The status query is the single source of truth for progress. Follows made
 * on the page are reported through `recordFollow`, which patches the status
 * optimistically and lets the server decide when the program is complete.
 */
export function useFourForFour( { onComplete }: UseFourForFourOptions = {} ) {
	const queryClient = useQueryClient();
	const candidatesQuery = useQuery( readFourForFourCandidatesQuery() );
	const statusQuery = useQuery( readFourForFourStatusQuery() );
	const { mutate } = useMutation( recordReadFourForFourProgressMutation( queryClient ) );

	const recordFollow = useCallback(
		( blogId: number ) => {
			const wasComplete =
				queryClient.getQueryData< ReadFourForFourStatusResponse >(
					getReadFourForFourStatusQueryKey()
				)?.status === 'completed';
			mutate(
				{ blog_ids: [ blogId ] },
				{
					onSuccess: ( status ) => {
						if ( status.status === 'completed' && ! wasComplete ) {
							onComplete?.( status );
						}
					},
				}
			);
		},
		[ mutate, onComplete, queryClient ]
	);

	return {
		candidates: candidatesQuery.data ?? [],
		isLoadingCandidates: candidatesQuery.isPending,
		isCandidatesError: candidatesQuery.isError,
		refetchCandidates: candidatesQuery.refetch,
		status: statusQuery.data?.status ?? null,
		followedCount: statusQuery.data?.followed_blog_ids.length ?? 0,
		recordFollow,
	};
}
