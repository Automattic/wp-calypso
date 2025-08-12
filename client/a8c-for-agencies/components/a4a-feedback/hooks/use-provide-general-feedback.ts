import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import useSubmitSupportFormMutation from 'calypso/a8c-for-agencies/data/support/use-submit-support-form-mutation';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import {
	FeedbackType,
	type FeedbackSurveyResponsesPayload,
	type GeneralFeedbackParams,
} from '../types';
import useSaveFeedbackMutation from './use-save-feedback-mutation';
import type { SubmitContactSupportParams } from 'calypso/a8c-for-agencies/data/support/types';

export const useProvideGeneralFeedback = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const agencyId = useSelector( getActiveAgencyId );
	const user = useSelector( getCurrentUser );

	const getMessage = useCallback( ( type: FeedbackType ) => {
		switch ( type ) {
			case FeedbackType.BugReport:
				return 'A4A Feedback - Bug Report';
			case FeedbackType.SuggestAFeature:
				return 'A4A Feedback - Suggest a Feature';
		}
	}, [] );

	const handleError = () => {
		dispatch(
			errorNotice(
				translate( 'An error occurred while submitting your feedback. Please try again.' ),
				{
					id: 'a4a-feedback-error',
					duration: 10000,
				}
			)
		);
	};

	const handleSuccess = () => {
		dispatch(
			successNotice(
				translate(
					'Thanks! Our team will use your feedback to help prioritize improvements to Automattic for Agencies.'
				),
				{
					id: 'a4a-feedback-success',
					duration: 10000,
				}
			)
		);
	};

	const {
		mutate: saveFeedback,
		isPending: isSavingFeedback,
		isSuccess: isSuccessFeedback,
	} = useSaveFeedbackMutation( {
		onSuccess: handleSuccess,
		onError: handleError,
	} );

	const { mutateAsync: submitSupportForm, isPending: isSubmittingSupportForm } =
		useSubmitSupportFormMutation( {
			onError: handleError,
		} );

	const handleSaveFeedback = useCallback(
		( feedback: GeneralFeedbackParams ) => {
			if ( ! agencyId || ! feedback.responses ) {
				return;
			}
			const { responses, type, ticketId } = feedback;
			// Convert the responses object to a format that can be sent so that we can send the correct data to MC Marketing Survey tool
			const surveyResponses = Object.entries( responses ).reduce(
				( acc, [ key, value ] ) => ( {
					...acc,
					[ key ]: { text: value },
				} ),
				{}
			);
			const params: FeedbackSurveyResponsesPayload = {
				site_id: agencyId,
				survey_id: type,
				survey_responses: { ...surveyResponses, ...( ticketId ? { ticket_id: ticketId } : {} ) },
			};
			saveFeedback( { params } );
			dispatch(
				recordTracksEvent( 'calypso_a4a_provide_feedback_feedback_submitted', {
					feedback_type: type,
				} )
			);
		},
		[ agencyId, dispatch, saveFeedback ]
	);

	const submitGeneralFeedback = useCallback(
		async ( feedback: GeneralFeedbackParams ) => {
			if ( ! agencyId || ! feedback.responses ) {
				return;
			}
			const { responses, type, screenshot } = feedback;
			// Create a Zendesk ticket for bug reports and feature suggestions.
			if ( [ FeedbackType.BugReport, FeedbackType.SuggestAFeature ].includes( type ) && user ) {
				const formData = new FormData();
				const fields = {
					...responses,
					product: 'a4a',
					message: getMessage( type ),
					name: user.display_name,
					email: user.email,
					agency_id: agencyId,
				};
				Object.entries( fields ).forEach( ( [ key, value ] ) => {
					if ( value ) {
						formData.append( key, value as string );
					}
				} );
				if ( screenshot ) {
					formData.append( 'screenshot', screenshot );
				}
				try {
					const response = await submitSupportForm(
						formData as unknown as SubmitContactSupportParams
					);
					dispatch(
						recordTracksEvent( 'calypso_a4a_provide_feedback_zendesk_ticket_submitted', {
							feedback_type: type,
						} )
					);
					const updatedFeedback = {
						...feedback,
						ticketId: response?.ticket_id,
					};
					handleSaveFeedback( updatedFeedback );
				} catch {
					// We are already handling the error
				}
			} else {
				handleSaveFeedback( feedback );
			}
		},
		[ agencyId, dispatch, getMessage, handleSaveFeedback, submitSupportForm, user ]
	);

	return {
		submitGeneralFeedback,
		isSubmitting: isSubmittingSupportForm || isSavingFeedback,
		isSuccess: isSuccessFeedback,
	};
};
