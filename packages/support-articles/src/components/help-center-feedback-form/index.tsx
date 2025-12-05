import { recordTracksEvent } from '@automattic/calypso-analytics';
import { GetSupport } from '@automattic/odie-client';
import { useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
import { useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { ThumbsDownIcon, ThumbsUpIcon } from '../../icons/thumbs';

declare const __i18n_text_domain__: string;

import './help-center-feedback-form.scss';

const HelpCenterFeedbackForm = ( {
	postId,
	isEligibleForChat,
	forceEmailSupport,
}: {
	postId: number;
	isEligibleForChat: boolean;
	forceEmailSupport: boolean;
} ) => {
	const { __ } = useI18n();
	const [ startedFeedback, setStartedFeedback ] = useState< boolean | null >( null );
	const [ answerValue, setAnswerValue ] = useState< number | null >( null );

	const { data: canConnectToZendesk } = useCanConnectToZendeskMessaging();

	const handleFeedbackClick = ( value: number ) => {
		setStartedFeedback( true );
		setAnswerValue( value );

		recordTracksEvent( 'calypso_inlinehelp_article_feedback_click', {
			did_the_article_help: value === 1 ? 'yes' : 'no',
			post_id: postId,
		} );
	};

	const FeedbackButtons = () => {
		return (
			<>
				<p>{ __( 'Was this helpful?', __i18n_text_domain__ ) }</p>
				<div className="help-center-feedback-form__buttons">
					<button
						// 1 is used as `yes` in crowdsignal as well, do not change
						onClick={ () => handleFeedbackClick( 1 ) }
					>
						{ __( 'Yes' ) } <ThumbsUpIcon />
					</button>
					<button
						// 2 is used as `no` in crowdsignal as well, do not change
						onClick={ () => handleFeedbackClick( 2 ) }
					>
						{ __( 'No' ) } <ThumbsDownIcon />
					</button>
				</div>
			</>
		);
	};

	const handleContactSupportClick = async ( destination: string ) => {
		recordTracksEvent( 'calypso_odie_chat_get_support', {
			location: 'article-feedback',
			destination,
			is_user_eligible: isEligibleForChat,
		} );
	};

	return (
		<div className="help-center-feedback__form">
			{ startedFeedback === null && <FeedbackButtons /> }
			{ startedFeedback !== null && answerValue === 1 && (
				<p>{ __( 'Great! Thanks.', __i18n_text_domain__ ) }</p>
			) }
			{ startedFeedback !== null && answerValue === 2 && (
				<>
					<div className="odie-chatbox-dislike-feedback-message">
						<p>
							{ __(
								'Would you like to get support? Select an option below:',
								__i18n_text_domain__
							) }
						</p>
					</div>
					<GetSupport
						onClickAdditionalEvent={ handleContactSupportClick }
						isUserEligibleForPaidSupport={ isEligibleForChat }
						canConnectToZendesk={ canConnectToZendesk }
						forceEmailSupport={ forceEmailSupport }
						forceAIConversation
					/>
				</>
			) }
		</div>
	);
};

export default HelpCenterFeedbackForm;
