import { recordTracksEvent } from '@automattic/calypso-analytics';
import { GetSupport } from '@automattic/odie-client/src/components/message/get-support';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useSupportStatus } from '../data/use-support-status';
import { useResetSupportInteraction } from '../hooks/use-reset-support-interaction';
import { ThumbsDownIcon, ThumbsUpIcon } from '../icons/thumbs';

import './help-center-feedback-form.scss';

const HelpCenterFeedbackForm = ( { postId }: { postId: number } ) => {
	const { __ } = useI18n();
	const [ startedFeedback, setStartedFeedback ] = useState< boolean | null >( null );
	const [ answerValue, setAnswerValue ] = useState< number | null >( null );

	const { data } = useSupportStatus();
	const isUserEligibleForPaidSupport = Boolean( data?.eligibility?.is_user_eligible );
	const { canConnectToZendesk } = useHelpCenterContext();
	const navigate = useNavigate();
	const resetSupportInteraction = useResetSupportInteraction();

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
			is_user_eligible: isUserEligibleForPaidSupport,
		} );
		if ( isUserEligibleForPaidSupport ) {
			await resetSupportInteraction();
			navigate( '/odie' );
		}
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
								'Would you like to contact our support team? Select an option below:',
								__i18n_text_domain__
							) }
						</p>
					</div>
					<GetSupport
						onClickAdditionalEvent={ handleContactSupportClick }
						isUserEligibleForPaidSupport={ isUserEligibleForPaidSupport }
						canConnectToZendesk={ canConnectToZendesk }
					/>
				</>
			) }
		</div>
	);
};

export default HelpCenterFeedbackForm;
