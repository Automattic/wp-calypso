import {
	readFourForFourCandidatesQuery,
	readFourForFourStatusQuery,
	recordReadFourForFourProgressMutation,
} from '@automattic/api-queries';
import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FOUR_FOR_FOUR_TRACKS_EVENT_PREFIX } from 'calypso/reader/four-for-four/constants';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import type {
	FollowSiteParams,
	ReadFourForFourCandidate,
	SiteSubscriptionItem,
} from '@automattic/api-core';

const EMPTY_IDS: number[] = [];
const EMPTY_CANDIDATES: ReadFourForFourCandidate[] = [];

// Waits before re-sending a follow the server didn't keep. The first retry is
// quick because most propagation settles in well under a second; the second
// gives it longer before we stop asking. One entry per retry, so a follow is
// sent at most PROGRESS_RETRY_DELAYS_MS.length + 1 times.
const PROGRESS_RETRY_DELAYS_MS = [ 500, 1500 ];
const MAX_PROGRESS_ATTEMPTS = PROGRESS_RETRY_DELAYS_MS.length + 1;

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
 *
 * The server answers with the follows it kept, and drops any it cannot verify
 * yet — a follow reported before it has propagated comes back missing from
 * that list. Those are re-sent a moment later rather than discarded, because
 * discarding one costs the user credit for a subscription they did make.
 */
export function useFourForFour() {
	const queryClient = useQueryClient();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const recordTracksRef = useRef( recordReaderTracksEvent );
	recordTracksRef.current = recordReaderTracksEvent;
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

	// IDs that are settled: either the server kept them, or it rejected them
	// enough times that we stopped asking. Never re-sent, so nothing can loop.
	const answeredBlogIds = useRef( new Set< number >() );
	// Rejected IDs still worth retrying, with the number of attempts so far.
	const rejectedAttempts = useRef( new Map< number, number >() );
	const [ retryDelayMs, setRetryDelayMs ] = useState< number | null >( null );

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
		if (
			! statusQuery.isSuccess ||
			isSaving ||
			isSaveError ||
			retryDelayMs !== null ||
			unsavedBlogIds.length === 0
		) {
			return;
		}
		recordProgress(
			{ blog_ids: unsavedBlogIds },
			{
				onSuccess: ( status, { blog_ids } ) => {
					const keptBlogIds = new Set( status.followed_blog_ids );
					let nextAttempt: number | null = null;

					blog_ids.forEach( ( blogId ) => {
						if ( keptBlogIds.has( blogId ) ) {
							rejectedAttempts.current.delete( blogId );
							answeredBlogIds.current.add( blogId );
							return;
						}

						const attempts = ( rejectedAttempts.current.get( blogId ) ?? 0 ) + 1;
						rejectedAttempts.current.set( blogId, attempts );

						if ( attempts >= MAX_PROGRESS_ATTEMPTS ) {
							answeredBlogIds.current.add( blogId );
							recordTracksRef.current( `${ FOUR_FOR_FOUR_TRACKS_EVENT_PREFIX }progress_dropped`, {
								blog_id: blogId,
								attempts,
							} );
							return;
						}

						nextAttempt = Math.min( nextAttempt ?? attempts, attempts );
					} );

					if ( nextAttempt !== null ) {
						setRetryDelayMs( PROGRESS_RETRY_DELAYS_MS[ nextAttempt - 1 ] );
					}
				},
			}
		);
	}, [
		statusQuery.isSuccess,
		isSaving,
		isSaveError,
		retryDelayMs,
		unsavedBlogIds,
		recordProgress,
	] );

	useEffect( () => {
		if ( retryDelayMs === null ) {
			return;
		}
		const timer = setTimeout( () => setRetryDelayMs( null ), retryDelayMs );
		return () => clearTimeout( timer );
	}, [ retryDelayMs ] );

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
