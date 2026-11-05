import {
	getReadFourForFourReviewMutationKey,
	readFourForFourStatusQuery,
	reviewReadFourForFourSiteMutation,
} from '@automattic/api-queries';
import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { FOUR_FOR_FOUR_TRACKS_EVENT_PREFIX } from 'calypso/reader/four-for-four/constants';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import type { ReadFourForFourReviewVerdict } from '@automattic/api-core';

/**
 * The verdicts that keep a writer's site out of 4 for 4. The server refuses
 * these writers credit too.
 */
export type FourForFourBlockingVerdict = Extract<
	ReadFourForFourReviewVerdict,
	'not_personal_blog' | 'not_english'
>;

const isBlockingVerdict = (
	verdict: ReadFourForFourReviewVerdict | undefined
): verdict is FourForFourBlockingVerdict =>
	verdict === 'not_personal_blog' || verdict === 'not_english';

/**
 * The content review that decides whether the writer's site can join 4 for 4.
 *
 * `/status` carries the stored verdict. When it has none, the site is reviewed
 * once on arrival, which takes a few seconds while a model reads the latest
 * posts. An `unchecked` verdict and a failed request both fail open, so the
 * writer can carry on.
 */
export function useFourForFourReview() {
	const queryClient = useQueryClient();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const statusQuery = useQuery( readFourForFourStatusQuery() );
	const review = useMutation( reviewReadFourForFourSiteMutation( queryClient ) );
	const reviewsInFlight = useIsMutating( { mutationKey: getReadFourForFourReviewMutationKey() } );

	const status = statusQuery.data;
	// The server only reviews the site a writer joined with, and refuses anyone else.
	const needsReview =
		!! status?.blog_id &&
		( status.status === 'opted_in' || status.status === 'completed' ) &&
		status.review === null;

	// One request per visit, so a failed review fails open instead of retrying.
	const hasRequestedReview = useRef( false );
	const { mutate: requestReview } = review;
	useEffect( () => {
		// A writer who leaves during a review and comes back finds it still
		// running. Wait for it rather than pay for a second model call: its
		// verdict lands in the status cache, and if it fails, this visit asks once.
		const isReviewInFlight =
			queryClient.isMutating( { mutationKey: getReadFourForFourReviewMutationKey() } ) > 0;
		if ( ! needsReview || hasRequestedReview.current || isReviewInFlight ) {
			return;
		}
		hasRequestedReview.current = true;

		const startedAt = Date.now();
		recordReaderTracksEvent( `${ FOUR_FOR_FOUR_TRACKS_EVENT_PREFIX }review_started` );
		requestReview( undefined, {
			onSuccess: ( { verdict, language, category, is_cached } ) => {
				recordReaderTracksEvent( `${ FOUR_FOR_FOUR_TRACKS_EVENT_PREFIX }review_completed`, {
					verdict,
					// Both are null for an `unchecked` review.
					language: language ?? undefined,
					category: category ?? undefined,
					duration_ms: Date.now() - startedAt,
					is_cached: is_cached ? 1 : 0,
				} );
			},
		} );
	}, [ needsReview, reviewsInFlight, queryClient, requestReview, recordReaderTracksEvent ] );

	// The mutation's own answer covers a status refetch that lands after it
	// and overwrites the cached verdict.
	const verdict = status?.review?.verdict ?? review.data?.verdict;

	return {
		isLoadingStatus: statusQuery.isPending,
		isReviewing: needsReview && ( review.isIdle || review.isPending ),
		blockingVerdict: isBlockingVerdict( verdict ) ? verdict : null,
	};
}
