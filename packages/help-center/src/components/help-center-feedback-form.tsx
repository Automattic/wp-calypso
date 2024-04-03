import { useI18n } from '@wordpress/react-i18n';
import React, { useState } from 'react';
import './help-center-feedback-form.scss';

const HelpCenterFeedbackForm: React.FC = () => {
	const { __ } = useI18n();
	const [ feedbackSent, setFeedbackSent ] = useState< boolean | null >( null );

	const handleFeedbackClick = () => {
		setFeedbackSent( true );
	};

	const FeedbackButtons = () => {
		return (
			<>
				<button onClick={ handleFeedbackClick }>{ __( 'Yes' ) } &#128077;</button>
				<button className="help-center-feedback-form__no-button" onClick={ handleFeedbackClick }>
					{ __( 'No' ) } &#128078;
				</button>
			</>
		);
	};

	const FeedbackTextArea = () => {
		return <>textarea here</>;
	};

	const feedbackButtons = FeedbackButtons();

	return (
		<div className="help-center-feedback__form">
			<p>{ __( 'Did you find the answer to your question?' ) }</p>
			{ feedbackSent === null ? feedbackButtons : FeedbackTextArea() }
		</div>
	);
};

export default HelpCenterFeedbackForm;
