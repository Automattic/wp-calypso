import {
	CSATForm,
	getBadRatingReasons,
	isTestModeEnvironment,
	useRateSurveyResponse,
} from '@automattic/zendesk-client';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { useOdieAssistantContext } from '../../context';
import { useSurveyResponseRating } from '../../hooks';
import type { MessageAction } from '../../types';

function parseSurveyResponseUri(
	uri: string
): { id: string; accessToken: string; zendeskOrigin: string } | null {
	try {
		const url = new URL( uri );
		const id = url.pathname.split( '/' ).filter( Boolean ).pop();
		const accessToken = url.searchParams.get( 'access_token' );

		if ( ! id || ! accessToken ) {
			return null;
		}

		return { id, accessToken, zendeskOrigin: url.hostname };
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

	if ( ! parsed ) {
		return null;
	}

	const onSendFeedback = async ( score: 'good' | 'bad' ): Promise< void > => {
		persistRating( score );
		await rateSurveyResponse( {
			survey_response_id: parsed.id,
			access_token: parsed.accessToken,
			zendesk_origin: parsed.zendeskOrigin,
			score,
			test_mode: isTestModeEnvironment(),
		} );
	};

	const onSendComment = async (
		comment: string,
		reasonId: string,
		score: 'good' | 'bad'
	): Promise< void > => {
		// This survey's actual closed-ended "reason" question has its own Zendesk-generated
		// option ids, which don't match our static reason codes -- fold the label into the
		// free-text comment instead of guessing at a mismatched structured answer.
		const reasonLabel = reasonId
			? getBadRatingReasons().find( ( reason ) => reason.value === reasonId )?.label
			: undefined;
		const combinedComment = [ reasonLabel, comment ].filter( Boolean ).join( ' - ' );

		await rateSurveyResponse( {
			survey_response_id: parsed.id,
			access_token: parsed.accessToken,
			zendesk_origin: parsed.zendeskOrigin,
			score,
			comment: combinedComment || undefined,
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
			onSendFeedback={ onSendFeedback }
			onSendComment={ onSendComment }
			onFormHidden={ persistDismissed }
		/>
	);
};
