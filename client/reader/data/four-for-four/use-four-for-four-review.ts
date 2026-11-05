import {
	readFourForFourStatusQuery,
	reviewReadFourForFourSiteMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { FOUR_FOR_FOUR_TRACKS_EVENT_PREFIX } from 'calypso/reader/four-for-four/constants';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';

/**
 * The content review that decides whether the writer's site can join 4 for 4.
 *
 * `/status` carries the stored verdict. When it has none, the site is reviewed
 * once on arrival, which takes a few seconds while a model reads the latest
 * posts. A failed request fails open, as an `unchecked` verdict does, so the
 * writer can carry on.
 */
export function useFourForFourReview() {
	const queryClient = useQueryClient();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const statusQuery = useQuery( readFourForFourStatusQuery() );
	const review = useMutation( reviewReadFourForFourSiteMutation( queryClient ) );

	const status = statusQuery.data;
	// The server only reviews the site a writer joined with, and refuses anyone else.
	const needsReview =
		!! status?.blog_id &&
		( status.status === 'opted_in' || status.status === 'completed' ) &&
		status.review === null;

	// Guards against a second request when the effect runs twice, as it does
	// under StrictMode. Each new review costs a model call.
	const hasRequestedReview = useRef( false );
	const { mutate: requestReview } = review;
	useEffect( () => {
		if ( ! needsReview || hasRequestedReview.current ) {
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
	}, [ needsReview, requestReview, recordReaderTracksEvent ] );

	return {
		isLoadingStatus: statusQuery.isPending,
		isReviewing: needsReview && ( review.isIdle || review.isPending ),
		// The mutation's own answer covers a status refetch that lands after it
		// and overwrites the cached verdict.
		verdict: status?.review?.verdict ?? review.data?.verdict ?? null,
	};
}
