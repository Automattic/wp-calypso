import {
	activeAgencyQuery,
	marketingSurveyMutation,
	rawUserPreferencesQuery,
	userPreferenceMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo } from 'react';
import { useAnalytics } from '../../app/analytics';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import type { FeedbackResponses, FeedbackType } from './types';
import type { A4AFeedbackPreferenceEntry } from '@automattic/api-core';

const FEEDBACK_PREFERENCE = 'a4a-feedback';

export default function useShowFeedback( type: FeedbackType ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { data: preferences } = useQuery( rawUserPreferencesQuery() );

	const feedbackByType = useMemo(
		() =>
			( preferences?.[ FEEDBACK_PREFERENCE ] ?? {} ) as Record<
				string,
				A4AFeedbackPreferenceEntry
			>,
		[ preferences ]
	);
	const entry = feedbackByType[ type ];
	const isFeedbackShown = !! ( entry?.lastSubmittedAt || entry?.lastSkippedAt );

	const { mutate: mutateSurvey, isPending: isSubmitting } = useMutation(
		withSnackbar( marketingSurveyMutation(), {
			success: __(
				'Thanks! Our team will use your feedback to help prioritize improvements to Automattic for Agencies.'
			),
			error: __( 'Something went wrong. Please try again later.' ),
		} )
	);
	const { mutate: mutatePreference } = useMutation( userPreferenceMutation( FEEDBACK_PREFERENCE ) );

	const writeTimestamp = useCallback(
		( key: 'lastSubmittedAt' | 'lastSkippedAt' ) => {
			const merged: Record< string, A4AFeedbackPreferenceEntry > = {
				...feedbackByType,
				[ type ]: { ...feedbackByType[ type ], [ key ]: Date.now() },
			};
			mutatePreference( merged );
		},
		[ feedbackByType, mutatePreference, type ]
	);

	const submit = useCallback(
		( responses: FeedbackResponses, onSuccess?: () => void ) => {
			const agencyId = agency?.id;
			if ( ! agencyId ) {
				return;
			}
			const surveyResponses = {
				rating: responses.experience,
				comment: { text: responses.comment },
				suggestions: { text: responses.suggestions.join( ', ' ) },
			};
			recordTracksEvent( 'calypso_a4a_feedback_submit', {
				agency_id: agencyId,
				survey_id: `${ FEEDBACK_PREFERENCE }-${ type }`,
				rating: responses.experience,
				suggestions: surveyResponses.suggestions.text,
				comment: surveyResponses.comment.text,
			} );
			mutateSurvey(
				{
					site_id: agencyId,
					survey_id: `${ FEEDBACK_PREFERENCE }-${ type }`,
					survey_responses: surveyResponses,
				},
				{
					onSuccess: () => {
						writeTimestamp( 'lastSubmittedAt' );
						onSuccess?.();
					},
				}
			);
		},
		[ agency?.id, recordTracksEvent, mutateSurvey, type, writeTimestamp ]
	);

	const skip = useCallback( () => {
		recordTracksEvent( 'calypso_a4a_feedback_skip', { type } );
		writeTimestamp( 'lastSkippedAt' );
	}, [ recordTracksEvent, type, writeTimestamp ] );

	return { isFeedbackShown, isSubmitting, submit, skip };
}
