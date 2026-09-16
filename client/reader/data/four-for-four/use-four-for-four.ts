import {
	readFourForFourCandidatesQuery,
	readFourForFourStatusQuery,
	recordReadFourForFourProgressMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { useSiteSubscriptions } from 'calypso/reader/data/site-subscriptions';
import { FOUR_FOR_FOUR_REQUIRED_SUBSCRIPTIONS } from 'calypso/reader/four-for-four/constants';
import type { ReadFourForFourCandidateResponse } from '@automattic/api-core';

const EMPTY_CANDIDATES: ReadFourForFourCandidateResponse[] = [];
const EMPTY_IDS: number[] = [];

/**
 * Candidate sites plus the user's progress through the 4 for 4 program.
 *
 * Progress is the union of what the server has already recorded and the
 * candidates the user currently follows. Any followed candidate the server
 * doesn't know about yet is sent to the progress endpoint, which flips the
 * status to `completed` once it holds four.
 */
export function useFourForFour() {
	const queryClient = useQueryClient();
	const candidatesQuery = useQuery( readFourForFourCandidatesQuery() );
	const statusQuery = useQuery( readFourForFourStatusQuery() );
	const { subscriptions } = useSiteSubscriptions( { fetchAllPages: true } );

	const candidates = candidatesQuery.data ?? EMPTY_CANDIDATES;
	const recordedBlogIds = statusQuery.data?.followed_blog_ids ?? EMPTY_IDS;

	const followedBlogIds = useMemo(
		() =>
			new Set(
				subscriptions
					.filter( ( subscription ) => subscription.is_following && subscription.blog_ID )
					.map( ( subscription ) => Number( subscription.blog_ID ) )
			),
		[ subscriptions ]
	);

	const followedCandidateIds = useMemo(
		() =>
			candidates
				.filter( ( candidate ) => followedBlogIds.has( candidate.blog_id ) )
				.map( ( candidate ) => candidate.blog_id ),
		[ candidates, followedBlogIds ]
	);

	const progressBlogIds = useMemo(
		() => Array.from( new Set( [ ...recordedBlogIds, ...followedCandidateIds ] ) ),
		[ recordedBlogIds, followedCandidateIds ]
	);

	const unrecordedBlogIds = useMemo(
		() => followedCandidateIds.filter( ( blogId ) => ! recordedBlogIds.includes( blogId ) ),
		[ followedCandidateIds, recordedBlogIds ]
	);

	const { mutate: recordProgress, isPending: isRecordingProgress } = useMutation(
		recordReadFourForFourProgressMutation( queryClient )
	);

	// Each distinct set of unrecorded IDs is sent once. A failed request is not
	// retried until the set changes (the next follow), which keeps a broken
	// endpoint from looping.
	const lastSentKeyRef = useRef( '' );
	const unrecordedKey = [ ...unrecordedBlogIds ].sort( ( a, b ) => a - b ).join( ',' );
	useEffect( () => {
		if (
			! unrecordedKey ||
			! statusQuery.isSuccess ||
			isRecordingProgress ||
			lastSentKeyRef.current === unrecordedKey
		) {
			return;
		}
		lastSentKeyRef.current = unrecordedKey;
		recordProgress( { blog_ids: unrecordedBlogIds } );
	}, [
		unrecordedKey,
		unrecordedBlogIds,
		statusQuery.isSuccess,
		isRecordingProgress,
		recordProgress,
	] );

	const status = statusQuery.data?.status ?? null;
	const progressCount = Math.min( progressBlogIds.length, FOUR_FOR_FOUR_REQUIRED_SUBSCRIPTIONS );
	const isComplete =
		status === 'completed' || progressBlogIds.length >= FOUR_FOR_FOUR_REQUIRED_SUBSCRIPTIONS;

	return {
		candidates,
		isLoadingCandidates: candidatesQuery.isPending,
		isCandidatesError: candidatesQuery.isError,
		refetchCandidates: candidatesQuery.refetch,
		status,
		followedBlogIds,
		progressCount,
		isComplete,
	};
}
