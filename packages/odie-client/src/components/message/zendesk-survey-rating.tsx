import {
	CSATForm,
	getZendeskSurveyResponseId,
	isTestModeEnvironment,
	useRateSurveyResponse,
	type SurveyReasonQuestion,
} from '@automattic/zendesk-client';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo, useState } from 'react';
import { useOdieAssistantContext } from '../../context';
import { useSurveyResponseRating } from '../../hooks';
import type { MessageAction } from '../../types';

function parseSurveyResponseUri( uri: string ): { id: string; accessToken: string } | null {
	try {
		const id = getZendeskSurveyResponseId( uri );
		const accessToken = new URL( uri ).searchParams.get( 'access_token' );

		if ( ! id || ! accessToken ) {
			return null;
		}

		return { id, accessToken };
	} catch {
		return null;
	}
}

export const ZendeskSurveyRating = ( { action }: { action: MessageAction } ) => {
	const parsed = useMemo(
		() => ( action.uri ? parseSurveyResponseUri( action.uri ) : null ),
		[ action.uri ]
	);
	const { mutateAsync: rateSurveyResponse } = useRateSurveyResponse();
	const { chat } = useOdieAssistantContext();
	const { __ } = useI18n();
	const { rating, recoveredRating, isDismissed, persistRating, persistDismissed } =
		useSurveyResponseRating( parsed?.id ?? '', chat.conversationId );
	// The survey's real closed-ended "reason" question, learned from the rating submission's
	// response (see rate_survey_response() on the backend) -- there's no way to know it before
	// that first round-trip, so the reason dropdown starts empty and fills in once it resolves.
	const [ reasonQuestion, setReasonQuestion ] = useState< SurveyReasonQuestion >( null );

	if ( ! parsed ) {
		return null;
	}

	const onSendFeedback = async ( score: 'good' | 'bad' ): Promise< void > => {
		persistRating( score );
		const result = await rateSurveyResponse( {
			survey_response_id: parsed.id,
			access_token: parsed.accessToken,
			score,
			test_mode: isTestModeEnvironment(),
		} );

		if ( result.reason_question ) {
			setReasonQuestion( result.reason_question );
		}
	};

	const onSendComment = async (
		comment: string,
		reasonOptionId: string,
		score: 'good' | 'bad'
	): Promise< void > => {
		await rateSurveyResponse( {
			survey_response_id: parsed.id,
			access_token: parsed.accessToken,
			score,
			comment: comment || undefined,
			reason_option_id: reasonOptionId || undefined,
			test_mode: isTestModeEnvironment(),
		} );
	};

	if ( isDismissed && rating ) {
		return (
			<div className="zendesk-csat-form">
				<div className="zendesk-csat-form__rating-message">
					<div>
						{ rating === 'good'
							? __( 'Good 👍', '__i18n_text_domain__' )
							: __( 'Needs improvement 👎', '__i18n_text_domain__' ) }
					</div>
				</div>
			</div>
		);
	}

	return (
		<CSATForm
			// Keyed on recoveredRating (set only by the mount-time metadata fetch), not the live
			// `rating` -- that would remount this the instant a thumb is clicked, before the
			// request even starts, discarding the in-progress loading state. This key only
			// changes when a genuine remount needs to recover an already-answered state.
			key={ recoveredRating ?? 'unrated' }
			ticketId={ null }
			preDeterminedScore={ recoveredRating }
			showRatingMessageWithPreDeterminedScore
			// Explicitly [] (not undefined) so CSATForm doesn't fall back to its static reason
			// codes -- those belong to the ticket-based flow and don't exist on this survey.
			reasonOptions={
				reasonQuestion?.options.map( ( option ) => ( {
					label: option.label,
					value: option.id,
				} ) ) ?? []
			}
			onSendFeedback={ onSendFeedback }
			onSendComment={ onSendComment }
			onFormHidden={ persistDismissed }
		/>
	);
};
