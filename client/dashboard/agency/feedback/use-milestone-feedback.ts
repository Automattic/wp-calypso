import {
	a4aFeedbackSurveyMutation,
	activeAgencyQuery,
	userPreferenceMutation,
	userPreferenceQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { useAnalytics } from '../../app/analytics';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { parseDateAsUTC } from '../../utils/datetime';
import type { FeedbackAnswer, FeedbackType } from './types';

const PREFERENCE = 'a4a-feedback';
const FEEDBACK_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Whether a milestone is recent enough to ask about. A milestone with no date
 * is always recent enough.
 */
export function isWithinFeedbackWindow( date: string | null ): boolean {
	if ( ! date ) {
		return true;
	}
	return Math.abs( Date.now() - parseDateAsUTC( date ).getTime() ) <= FEEDBACK_WINDOW_MS;
}

export function useMilestoneFeedback( type: FeedbackType ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { data: answered, isLoading: isLoadingPreference } = useQuery(
		userPreferenceQuery( PREFERENCE )
	);
	const { mutate: fileSurvey, isPending: isSubmitting } = useMutation(
		withSnackbar( a4aFeedbackSurveyMutation(), {
			success: __(
				'Thanks! Our team will use your feedback to help prioritize improvements to Automattic for Agencies.'
			),
			error: __( 'Failed to send your feedback. Please try again.' ),
		} )
	);
	// On the mutation, not the mutate() call: the modal unmounts before the
	// write settles, and per-call callbacks are dropped on unmount.
	const { mutate: rememberAnswer } = useMutation(
		withSnackbar( userPreferenceMutation( PREFERENCE ), {
			error: __( 'We couldn’t save your answer, so we may ask again later.' ),
		} )
	);

	const agencyId = agency?.id;
	const entry = answered?.[ type ];
	const shouldAsk =
		!! agencyId &&
		! isLoadingPreference &&
		answered !== undefined &&
		! entry?.lastSubmittedAt &&
		! entry?.lastSkippedAt;

	const remember = useCallback(
		( field: 'lastSubmittedAt' | 'lastSkippedAt' ) =>
			rememberAnswer( {
				...answered,
				[ type ]: { ...answered?.[ type ], [ field ]: Date.now() },
			} ),
		[ answered, rememberAnswer, type ]
	);

	const submit = useCallback(
		( answer: FeedbackAnswer, { onSuccess }: { onSuccess: () => void } ) => {
			if ( ! agencyId ) {
				return;
			}

			const surveyResponses = {
				rating: answer.rating,
				comment: { text: answer.comments },
				suggestions: { text: answer.suggestions.join( ', ' ) },
			};

			recordTracksEvent( 'calypso_a4a_feedback_submit', {
				agency_id: agencyId,
				survey_id: type,
				rating: surveyResponses.rating,
				suggestions: surveyResponses.suggestions.text,
				comment: surveyResponses.comment.text,
			} );

			fileSurvey(
				{
					site_id: agencyId,
					survey_id: type,
					survey_responses: surveyResponses,
				},
				{
					onSuccess: () => {
						// Only now: a failed survey must not spend the one chance to ask.
						remember( 'lastSubmittedAt' );
						onSuccess();
					},
				}
			);
		},
		[ agencyId, fileSurvey, recordTracksEvent, remember, type ]
	);

	const skip = useCallback( () => {
		recordTracksEvent( 'calypso_a4a_feedback_skip', { type } );
		remember( 'lastSkippedAt' );
	}, [ recordTracksEvent, remember, type ] );

	return { shouldAsk, submit, skip, isSubmitting };
}
