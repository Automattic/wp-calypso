import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useI18n } from '@wordpress/react-i18n';
import React, { useState } from 'react';
import { ThumbsDownIcon, ThumbsUpIcon } from '../icons/thumbs';
import './help-center-feedback-form.scss';

interface HelpCenterFeedbackFormProps {
	postId: number;
	blogId?: string | null;
}
const HelpCenterFeedbackForm = ( { postId, blogId }: HelpCenterFeedbackFormProps ) => {
	const { __ } = useI18n();
	const [ startedFeedback, setStartedFeedback ] = useState< boolean | null >( null );
	const [ answerValue, setAnswerValue ] = useState< number | null >( null );

	const handleFeedbackClick = ( value: number ) => {
		setStartedFeedback( true );
		setAnswerValue( value );

		recordTracksEvent( `calypso_inlinehelp_article_feedback_click`, {
			did_the_article_help: value === 1 ? 'yes' : 'no',
			post_id: postId,
		} );
	};

	const FeedbackButtons = () => (
		<>
			<p>{ __( 'Did you find the answer to your question?' ) }</p>
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

	const FeedbackTextArea = () => (
		<>
			<p>{ __( 'How we can improve?' ) }</p>
			<iframe
				title={ __( 'Feedback Form' ) }
				// This is the URL of the feedback form,
				// `answerValue` is either 1 or 2 and it is used to skip the first question since we are already asking it here.
				// it is necessary to help crowd signal to `skip` ( display none with css ) the first question and save the correct value.
				src={ `https://wordpressdotcom.survey.fm/helpcenter-articles-feedback?q_1_choice=${ answerValue }&postId=${ postId }&blogId=${ blogId }` }
			></iframe>
		</>
	);

	return (
		<div className="help-center-feedback__form">
			{ startedFeedback === null ? <FeedbackButtons /> : <FeedbackTextArea /> }
		</div>
	);
};

export default HelpCenterFeedbackForm;
