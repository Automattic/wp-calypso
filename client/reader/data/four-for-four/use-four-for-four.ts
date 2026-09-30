import {
	readFourForFourCandidatesQuery,
	readFourForFourStatusQuery,
	recordReadFourForFourProgressMutation,
} from '@automattic/api-queries';
import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import type {
	FollowSiteParams,
	ReadFourForFourCandidate,
	SiteSubscriptionItem,
} from '@automattic/api-core';

const EMPTY_IDS: number[] = [];
const EMPTY_CANDIDATES: ReadFourForFourCandidate[] = [];

/**
 * Candidate sites plus the user's progress through the 4 for 4 program.
 *
 * The status query is the source of truth for progress, but follows made on
 * the page count toward the displayed total as soon as they are clicked. A
 * follow is reported to the progress endpoint only once its request has
 * succeeded, since the server verifies the subscription before counting it.
 *
 * Reports go out one at a time and carry every follow the server hasn't
 * acknowledged yet, so a lost or failed report is made up by the next one.
 * After a failed report, nothing more is sent until `retrySave` is called.
 */
export function useFourForFour() {
	const queryClient = useQueryClient();
	const candidatesQuery = useQuery( readFourForFourCandidatesQuery() );
	const statusQuery = useQuery( readFourForFourStatusQuery() );
	const progress = useMutation( recordReadFourForFourProgressMutation( queryClient ) );

	const candidates = candidatesQuery.data ?? EMPTY_CANDIDATES;
	const recordedBlogIds = statusQuery.data?.followed_blog_ids ?? EMPTY_IDS;

	const follows = useMutationState( {
		filters: {
			predicate: ( mutation ) =>
				mutation.options.meta?.statId === 'read-site-follow' &&
				( mutation.state.status === 'pending' || mutation.state.status === 'success' ),
		},
		select: ( mutation ) => ( {
			isSuccess: mutation.state.status === 'success',
			feedUrl: ( mutation.state.variables as FollowSiteParams | undefined )?.feedUrl ?? '',
			blogId: Number( ( mutation.state.data as SiteSubscriptionItem | undefined )?.blog_ID ?? 0 ),
		} ),
	} );

	// Pending follows only know the URL they were sent with; resolve it to the
	// candidate so the meter can move before the server answers.
	const candidateBlogIdByUrl = useMemo(
		() =>
			new Map(
				candidates.map( ( candidate ) => [ candidate.feedUrl || candidate.url, candidate.blogId ] )
			),
		[ candidates ]
	);
	const candidateBlogIds = useMemo(
		() => new Set( candidates.map( ( candidate ) => candidate.blogId ) ),
		[ candidates ]
	);

	const candidateFollows = useMemo(
		() =>
			follows
				.map( ( follow ) => ( {
					...follow,
					blogId: follow.blogId || candidateBlogIdByUrl.get( follow.feedUrl ) || 0,
				} ) )
				.filter( ( follow ) => candidateBlogIds.has( follow.blogId ) ),
		[ follows, candidateBlogIdByUrl, candidateBlogIds ]
	);

	// IDs the server has answered for, whether or not it kept them (it drops
	// follows it can't verify). Never re-sent, so a dropped ID can't loop.
	const answeredBlogIds = useRef( new Set< number >() );

	const unsavedBlogIds = useMemo(
		() =>
			Array.from(
				new Set(
					candidateFollows
						.filter( ( follow ) => follow.isSuccess )
						.map( ( follow ) => follow.blogId )
						.filter(
							( blogId ) =>
								! recordedBlogIds.includes( blogId ) && ! answeredBlogIds.current.has( blogId )
						)
				)
			),
		[ candidateFollows, recordedBlogIds ]
	);

	const { mutate: recordProgress, isPending: isSaving, isError: isSaveError } = progress;
	useEffect( () => {
		if ( ! statusQuery.isSuccess || isSaving || isSaveError || unsavedBlogIds.length === 0 ) {
			return;
		}
		recordProgress(
			{ blog_ids: unsavedBlogIds },
			{
				onSuccess: ( _status, { blog_ids } ) => {
					blog_ids.forEach( ( blogId ) => answeredBlogIds.current.add( blogId ) );
				},
			}
		);
	}, [ statusQuery.isSuccess, isSaving, isSaveError, unsavedBlogIds, recordProgress ] );

	const followedCount = new Set( [
		...recordedBlogIds,
		...candidateFollows.map( ( follow ) => follow.blogId ),
	] ).size;

	const retrySave = () => {
		if ( statusQuery.isError ) {
			statusQuery.refetch();
		}
		if ( progress.isError ) {
			progress.reset();
		}
	};

	return {
		candidates,
		isLoadingCandidates: candidatesQuery.isPending,
		isCandidatesError: candidatesQuery.isError,
		refetchCandidates: candidatesQuery.refetch,
		status: statusQuery.data?.status ?? null,
		followedCount,
		hasSaveError: statusQuery.isError || progress.isError,
		retrySave,
	};
}
