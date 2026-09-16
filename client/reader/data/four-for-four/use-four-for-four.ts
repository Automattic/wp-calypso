import {
	readFourForFourCandidatesQuery,
	readFourForFourStatusQuery,
	recordReadFourForFourProgressMutation,
} from '@automattic/api-queries';
import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import type { ReadFourForFourCandidate, SiteSubscriptionItem } from '@automattic/api-core';

const EMPTY_IDS: number[] = [];
const EMPTY_CANDIDATES: ReadFourForFourCandidate[] = [];

/**
 * Candidate sites plus the user's progress through the 4 for 4 program.
 *
 * The status query is the single source of truth for progress. A follow made
 * on the page is reported to the progress endpoint only once the follow
 * request has succeeded, since the server verifies the subscription before
 * counting it; the follow button's click callback fires too early for that.
 */
export function useFourForFour() {
	const queryClient = useQueryClient();
	const candidatesQuery = useQuery( readFourForFourCandidatesQuery() );
	const statusQuery = useQuery( readFourForFourStatusQuery() );
	const { mutate: recordProgress } = useMutation(
		recordReadFourForFourProgressMutation( queryClient )
	);

	const candidates = candidatesQuery.data ?? EMPTY_CANDIDATES;
	const recordedBlogIds = statusQuery.data?.followed_blog_ids ?? EMPTY_IDS;

	const successfulFollows = useMutationState( {
		filters: {
			status: 'success',
			predicate: ( mutation ) => mutation.options.meta?.statId === 'read-site-follow',
		},
		select: ( mutation ) => ( {
			id: mutation.mutationId,
			blogId: Number( ( mutation.state.data as SiteSubscriptionItem | undefined )?.blog_ID ?? 0 ),
		} ),
	} );

	const candidateBlogIds = useMemo(
		() => new Set( candidates.map( ( candidate ) => candidate.blogId ) ),
		[ candidates ]
	);

	// Each successful follow mutation is reported at most once.
	const reportedMutationIds = useRef( new Set< number >() );
	useEffect( () => {
		if ( ! statusQuery.isSuccess ) {
			return;
		}
		for ( const follow of successfulFollows ) {
			if ( reportedMutationIds.current.has( follow.id ) ) {
				continue;
			}
			reportedMutationIds.current.add( follow.id );
			if ( candidateBlogIds.has( follow.blogId ) && ! recordedBlogIds.includes( follow.blogId ) ) {
				recordProgress( { blog_ids: [ follow.blogId ] } );
			}
		}
	}, [
		successfulFollows,
		candidateBlogIds,
		recordedBlogIds,
		statusQuery.isSuccess,
		recordProgress,
	] );

	return {
		candidates,
		isLoadingCandidates: candidatesQuery.isPending,
		isCandidatesError: candidatesQuery.isError,
		refetchCandidates: candidatesQuery.refetch,
		status: statusQuery.data?.status ?? null,
		followedCount: recordedBlogIds.length,
	};
}
